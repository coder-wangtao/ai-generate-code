**1. 设计多阶段可编排 Agent 架构**
明确把生成流程拆成 Input Phase → Parsing Phase（确定性）→ Refactoring Phase（AI）→ Assembly Phase（确定性） 四个阶段。
使用 StateGraph + Annotation.Root 定义共享状态（FigmaGraphState），每个节点通过 addNode 注册，通过 addEdge 串联成线性/可扩展的执行链。
状态在节点间自动流转（rawCode → astParserResult → geometryGroupResult → sectionNamingResult → generatedFiles → files），支持 checkpointer（MemorySaver）持久化，便于观测和恢复。
MemorySaver 是内存版实现，数据只存在于进程内存中。PostgresSaver（存数据库）。RedisSaver（存 Redis）。

**2. 构建生成结果的结构化约束机制**

<!--
export function getStructuredModel<T extends ZodType<any>>(schema: T) {
  const model = getMainModel();
  return model.withStructuredOutput(schema, {
    method: "functionCalling",
    includeRaw: false,
  });
} -->

把任意 Zod Schema 通过 LangChain 的 withStructuredOutput + functionCalling 方式绑定到模型上，强制 LLM 必须按照 Schema 的结构输出 JSON，而不能自由发挥。

**3. 设计“LLM 推理 + 程序确定性执行”混合架构**
LLM 推理阶段：componentGenNode、sectionNamingNode、typeNode 等节点通过 Prompt + LLM 完成语义规划、组件拆分、命名、类型定义等创造性工作。
程序确定性执行阶段：紧随其后的 assemblyNode（Sandpack 格式组装）、postProcessNode/figmaPostProcessNode（AST 修复）、依赖扫描、路径规范化等，完全由代码逻辑保证一致性与可预测性。

**4. 构建生成代码可运行保障机制**
通过 extractImports 解析所有代码文件中的 import / require 语句，自动收集第三方包并从 VERSION_MAP 补全版本号。
最终生成完整的 package.json，显著降低“缺依赖”导致的运行失败风险。

检测 JSX 中直接渲染对象类型变量的问题：

<p>{article.author}</p>           → <p>{article.author?.name}</p>
<span>{item.category}</span> → <span>{item.category?.name}</span>
{reviews.map(r => <p>{r}</p>)} → {reviews.map(r => <p>{r?.name}</p>)}
核心逻辑：
通过 TypeAnalyzer 获知哪些字段是对象类型
扫描所有 JSX 表达式
如果表达式直接引用了对象类型字段（没有继续访问子属性），标记为问题
修复：在对象访问末尾追加 ?.suggestedProperty
对象类型字段直接渲染在 JSX 中（"Objects are not valid as React child"）
缺少可选链导致 null crash（"Cannot read properties of null"）
数组/字符串方法调用缺少空值检查
主要使用typescript这个包

**5. 构建调试与稳定性增强机制**

<!--
export function resolveMockConfig(
  config: MockConfig,
): Record<NodeName, boolean> {
  // 1. 检查节点级别配置（最高优先级）
  if (config.nodes?.[nodeName] !== undefined) { ... }
  // 2. 检查阶段级别配置
  if (config.phases) { ... }
  // 3. 使用全局配置
  if (config.global !== undefined) { ... }
  // 4. 默认值：true
} -->
<!--
/**
 * 分层 Mock 配置
 *
 * 支持三种粒度的控制，按优先级从低到高：
 * 1. global: 全局开关
 * 2. phases: 按阶段控制
 * 3. nodes: 按节点控制（最高优先级，可覆盖上层设置）
 */
export interface MockConfig {
  /** 全局开关 - 最低优先级 */
  global?: boolean;
  /** 阶段开关 - 中等优先级 */
  phases?: Partial<Record<PhaseName, boolean>>;
  /** 节点开关 - 最高优先级（覆盖上层） */
  nodes?: Partial<Record<NodeName, boolean>>;
} -->
