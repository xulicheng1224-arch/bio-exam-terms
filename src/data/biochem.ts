/**
 * 338 Biochemistry glossary, curated from the Wuhan University past papers
 * (2022, 2023 D, 2024 A, 2025, 2026 A recalled).
 *
 * The 338 paper prints its 名词解释 in Chinese, so the English terms here are
 * curated (rather than quoted) from the standard names for each concept. The
 * target school is being prepared for English prompts in all three subjects.
 */

import type { Term } from '../types';

export const BIOCHEM_TERMS: readonly Term[] = [
  {
    id: 'biochem-0001',
    subject: 'biochem',
    en: 'alpha-amino acid',
    cn: 'α-氨基酸',
    defCn:
      '分子中氨基和羧基连接在同一个碳原子（即α-碳原子）上的氨基酸，是构成蛋白质的基本单位。除甘氨酸外，其α-碳原子都是手性碳原子，故具有旋光性。',
    topic: '蛋白质的结构与功能',
    note: '',
  },
  {
    id: 'biochem-0002',
    subject: 'biochem',
    en: 'peptide plane',
    cn: '肽平面',
    defCn:
      '蛋白质分子中由肽键及其两侧的两个α-碳原子共同构成的刚性平面结构。由于肽键具有部分双键性质而不能自由旋转，与肽键相连的C、O、N、H四个原子和两个α-碳原子共处同一平面。',
    topic: '蛋白质的结构与功能',
    note: '与"肽键"区分：肽键是C—N共价键，肽平面是包含该键的整个刚性平面。',
  },
  {
    id: 'biochem-0003',
    subject: 'biochem',
    en: 'conformation',
    cn: '构象',
    defCn:
      '同一分子由于单键旋转而产生的、不改变共价键组成和构型的空间排列方式。蛋白质的构象决定其生物学功能，构象改变往往伴随功能改变。',
    topic: '蛋白质的结构与功能',
    note: '与"构型"区分：构型改变必须断键，构象改变只需单键旋转。',
  },
  {
    id: 'biochem-0004',
    subject: 'biochem',
    en: 'hydrophobic interaction',
    cn: '疏水相互作用',
    defCn:
      '非极性分子或基团在水溶液中倾向于相互聚集、以减少与水的接触面积的作用力，是维持蛋白质三级结构的主要作用力之一，在蛋白质折叠中起决定性作用。',
    topic: '蛋白质的结构与功能',
    note: '',
  },
  {
    id: 'biochem-0005',
    subject: 'biochem',
    en: 'Michaelis constant',
    cn: '米氏常数',
    defCn:
      '酶促反应速度达到最大反应速度一半时的底物浓度，用Km表示，单位为浓度单位。Km是酶的特征性常数，其值越小表示酶与底物的亲和力越大。',
    topic: '酶',
    note: '要能写出米氏方程并说明Km的物理意义，简答题常与Vmax一起考。',
  },
  {
    id: 'biochem-0006',
    subject: 'biochem',
    en: 'isozyme',
    cn: '同工酶',
    defCn:
      '催化相同的化学反应，但分子结构、理化性质和免疫学性质不同的一组酶。它们可存在于同一生物体的不同组织中，如乳酸脱氢酶有五种同工酶。',
    topic: '酶',
    note: '',
  },
  {
    id: 'biochem-0007',
    subject: 'biochem',
    en: 'allosteric enzyme and allosteric effect',
    cn: '别构酶和别构效应',
    defCn:
      '别构酶是指含有多个亚基、除活性中心外还含别构中心的酶；别构效应是指效应物与别构中心以非共价方式结合后引起酶分子构象改变，从而改变其催化活性的现象，其动力学曲线呈S形。',
    topic: '酶',
    note: '答题时分两部分写：先定义别构酶，再定义别构效应。',
  },
  {
    id: 'biochem-0008',
    subject: 'biochem',
    en: 'glycosidic bond',
    cn: '糖苷键',
    defCn:
      '一个单糖分子上半缩醛羟基的氢原子与另一分子上羟基（或氨基）的氢原子脱水缩合形成的共价键，是连接单糖构成寡糖和多糖的化学键。',
    topic: '糖类代谢',
    note: '',
  },
  {
    id: 'biochem-0009',
    subject: 'biochem',
    en: 'glycoconjugate',
    cn: '糖缀合物',
    defCn:
      '糖类与蛋白质、脂质等非糖物质以共价键结合形成的复合物，主要包括糖蛋白、蛋白聚糖和糖脂等，在细胞识别、免疫应答、信号传递和物质运输中发挥重要作用。',
    topic: '糖类代谢',
    note: '',
  },
  {
    id: 'biochem-0010',
    subject: 'biochem',
    en: 'glycolysis',
    cn: '糖酵解',
    defCn:
      '葡萄糖在细胞质中经十步酶促反应分解为丙酮酸、并净生成2分子ATP和2分子NADH的过程。该途径不需要氧参与，有3个关键酶，是所有生物共有的糖分解途径。',
    topic: '糖类代谢',
    note: '2025年与2026年连续考过。三个关键酶（己糖激酶、磷酸果糖激酶-1、丙酮酸激酶）是常见得分点。',
  },
  {
    id: 'biochem-0011',
    subject: 'biochem',
    en: 'gluconeogenesis',
    cn: '糖异生',
    defCn:
      '由非糖物质（乳酸、甘油、生糖氨基酸等）转变为葡萄糖或糖原的过程，主要在肝脏和肾脏中进行。因糖酵解的三个不可逆反应需要由另外的酶绕过，故糖异生并不是糖酵解的简单逆转。',
    topic: '糖类代谢',
    note: '常与糖酵解对比考，注意答出四个糖异生特有的关键酶。',
  },
  {
    id: 'biochem-0012',
    subject: 'biochem',
    en: 'tricarboxylic acid cycle',
    cn: '三羧酸循环',
    defCn:
      '乙酰CoA在线粒体中经柠檬酸合成、两次氧化脱羧和四次脱氢等反应彻底氧化为CO2，并生成NADH、FADH2和GTP的循环途径。它是糖、脂和蛋白质代谢的最终共同通路。',
    topic: '糖类代谢',
    note: '又称柠檬酸循环或Krebs循环。与"乙醛酸循环"区分：后者绕过两次脱羧，可净生成琥珀酸。',
  },
  {
    id: 'biochem-0013',
    subject: 'biochem',
    en: 'pentose phosphate pathway',
    cn: '磷酸戊糖途径',
    defCn:
      '葡萄糖在细胞质中先经氧化阶段生成NADPH和5-磷酸核糖，再经非氧化阶段的基团转移反应实现磷酸戊糖相互转变的代谢途径，为生物合成提供还原力和核糖，与糖酵解在6-磷酸葡萄糖处分支。',
    topic: '糖类代谢',
    note: '答题要写出它的生物学意义：提供NADPH和5-磷酸核糖。',
  },
  {
    id: 'biochem-0014',
    subject: 'biochem',
    en: 'glyoxylate cycle',
    cn: '乙醛酸循环',
    defCn:
      '存在于植物、微生物等生物中的一种变异的三羧酸循环途径，通过异柠檬酸裂合酶和苹果酸合酶两个关键酶绕过三羧酸循环中的两次脱羧反应，使乙酰CoA能够净生成琥珀酸，进而合成糖类。',
    topic: '糖类代谢',
    note: '',
  },
  {
    id: 'biochem-0015',
    subject: 'biochem',
    en: 'beta-oxidation of fatty acids',
    cn: '脂肪酸的β-氧化',
    defCn:
      '脂肪酸在体内氧化分解的主要方式，从脂肪酸的β-碳原子开始，依次经过脱氢、加水、再脱氢和硫解四步反复进行的反应，每轮从羧基端断下一个乙酰CoA，使碳链缩短两个碳原子。',
    topic: '脂质代谢',
    note: '常与脂肪酸合成对比考（场所、载体、辅酶、能量、酶系统）。',
  },
  {
    id: 'biochem-0016',
    subject: 'biochem',
    en: 'ketone bodies',
    cn: '酮体',
    defCn:
      '脂肪酸在肝脏中氧化分解时产生并输出的乙酰乙酸、β-羟丁酸和丙酮三种中间产物的统称，是肝脏向肝外组织输送能量的形式，肝脏自身缺乏利用酮体的酶。',
    topic: '脂质代谢',
    note: '答题要写出三种分子，并说明"肝内生酮、肝外利用"这一特点。',
  },
  {
    id: 'biochem-0017',
    subject: 'biochem',
    en: 'respiratory chain',
    cn: '呼吸链',
    defCn:
      '又称电子传递链，是位于线粒体内膜上、由复合体Ⅰ至Ⅳ等一组电子传递体按氧化还原电位由低到高排列组成的链式反应体系，将代谢物脱下的氢和电子依次传递给氧生成水，同时释放能量供ATP合成。',
    topic: '生物氧化',
    note: '',
  },
  {
    id: 'biochem-0018',
    subject: 'biochem',
    en: 'oxidative phosphorylation',
    cn: '氧化磷酸化',
    defCn:
      '代谢物脱下的氢经呼吸链氧化传递时逐步释放能量，驱动ADP与无机磷酸结合生成ATP的过程，是需氧生物合成ATP的主要方式，可用化学渗透学说解释其机制。',
    topic: '生物氧化',
    note: '2022年与2023年连续考过。注意与底物水平磷酸化区分。',
  },
  {
    id: 'biochem-0019',
    subject: 'biochem',
    en: 'pyruvate dehydrogenase complex',
    cn: '丙酮酸脱氢酶系',
    defCn:
      '位于线粒体内膜上、催化丙酮酸氧化脱羧生成乙酰CoA的多酶复合体，由丙酮酸脱氢酶、二氢硫辛酰转乙酰酶和二氢硫辛酸脱氢酶三种酶以及焦磷酸硫胺素等五种辅酶组成，是不可逆反应的限速环节。',
    topic: '糖类代谢',
    note: '注意答出三种酶和五种辅酶，这是常见的采分点。',
  },
  {
    id: 'biochem-0020',
    subject: 'biochem',
    en: 'salvage pathway of nucleotide synthesis',
    cn: '核苷酸的补救合成',
    defCn:
      '利用体内游离的碱基或核苷，经酶催化直接转变为相应核苷酸的途径，不需要从头合成那样消耗大量能量和氨基酸前体，可节省原料与能量，是脑、骨髓等组织合成核苷酸的主要方式。',
    topic: '核苷酸代谢',
    note: '2023年与2025年都考过。与"从头合成"相对。',
  },
  {
    id: 'biochem-0021',
    subject: 'biochem',
    en: 'carbamoyl phosphate synthetase I',
    cn: '氨甲酰磷酸合成酶Ⅰ',
    defCn:
      '存在于肝细胞线粒体中的酶，以氨、二氧化碳和ATP为底物合成氨甲酰磷酸，是尿素循环的限速酶和第一个调控位点，其活性受N-乙酰谷氨酸的别构激活。',
    topic: '氨基酸代谢',
    note: '与尿素循环直接相关，注意与利用谷氨酰胺的Ⅱ型区分。',
  },
  {
    id: 'biochem-0022',
    subject: 'biochem',
    en: 'Bohr effect',
    cn: '波尔效应',
    defCn:
      '血液pH降低或二氧化碳分压升高时，血红蛋白对氧的亲和力下降、氧解离曲线右移的现象。其生理意义在于使代谢旺盛的组织在酸性环境中获取更多的氧气。',
    topic: '蛋白质的结构与功能',
    note: '常与"协同效应""别构效应"一起出现在论述题中。',
  },
];
