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
  {
    id: 'biochem-0023',
    subject: 'biochem',
    en: 'Peptide bond',
    cn: '肽键',
    defCn:
      '一个氨基酸的α-羧基与另一个氨基酸的α-氨基脱去一分子水后形成的酰胺键，具有部分双键性质而不能自由旋转，是连接氨基酸构成多肽链和蛋白质的主要共价键。',
    topic: '蛋白质的结构与功能',
    note: '与"肽平面"区分：肽键是那个C—N共价键，肽平面是包含它的整个刚性平面。',
  },
  {
    id: 'biochem-0024',
    subject: 'biochem',
    en: 'Protein denaturation',
    cn: '蛋白质变性',
    defCn:
      '蛋白质受到高温、极端pH、有机溶剂、尿素或去垢剂等理化因素影响时，其空间构象被破坏，理化性质和生物学活性随之改变或丧失，但一级结构（肽键）并未断裂。',
    topic: '蛋白质的结构与功能',
    note: '2025年简答题考过"高温、极端pH、除垢剂、尿素诱导变性的原理分别是什么"——关键得分点是各因素破坏的作用力不同。',
  },
  {
    id: 'biochem-0025',
    subject: 'biochem',
    en: 'Quaternary structure',
    cn: '蛋白质四级结构',
    defCn:
      '由两条或两条以上具有三级结构的多肽链（亚基）通过非共价键聚合而成的特定空间排布方式，是蛋白质最高层次的结构，血红蛋白是典型例子。',
    topic: '蛋白质的结构与功能',
    note: '注意四级结构中各亚基单独存在时通常无活性，聚合后才表现生物学功能。',
  },
  {
    id: 'biochem-0026',
    subject: 'biochem',
    en: 'Isoelectric point',
    cn: '等电点',
    defCn:
      '氨基酸或蛋白质分子所带正负电荷恰好相等、净电荷为零时溶液的pH值，此时分子在电场中不移动，溶解度最低，常用于蛋白质的分离纯化。',
    topic: '蛋白质的结构与功能',
    note: '2025年判断题涉及"pH3.0时所有氨基酸都带正电"，需理解等电点与电荷的关系。',
  },
  {
    id: 'biochem-0027',
    subject: 'biochem',
    en: 'Active site',
    cn: '酶的活性中心',
    defCn:
      '酶分子中直接与底物结合并催化底物发生化学反应的特定区域，由结合部位和催化部位组成，通常只占酶分子很小的部分，其三维构象决定酶的专一性。',
    topic: '酶',
    note: '与别构中心区分：别构中心位于活性中心之外，结合效应物后通过构象变化间接调节酶活性。',
  },
  {
    id: 'biochem-0028',
    subject: 'biochem',
    en: 'Cofactor',
    cn: '辅助因子',
    defCn:
      '酶催化活性所必需的、本身为小分子有机物或金属离子的非蛋白质成分，与酶蛋白结合构成全酶，其中与酶蛋白共价结合较牢固的称为辅基，结合疏松的称为辅酶。',
    topic: '酶',
    note: '全酶＝酶蛋白＋辅助因子，只有二者结合时才具有催化活性。',
  },
  {
    id: 'biochem-0029',
    subject: 'biochem',
    en: 'Coenzyme A',
    cn: '辅酶A',
    defCn:
      '由泛酸、腺嘌呤、核糖和磷酸组成的辅酶，其巯基可与酰基结合形成硫酯键，是酰基转移反应中最重要的辅酶，如携带乙酰基生成乙酰CoA进入三羧酸循环。',
    topic: '酶',
    note: '缩写 CoA。丙酮酸脱氢酶系、三羧酸循环、脂肪酸氧化都依赖它。',
  },
  {
    id: 'biochem-0030',
    subject: 'biochem',
    en: 'Michaelis-Menten equation',
    cn: '米氏方程',
    defCn:
      '描述酶促反应初速度与底物浓度关系的方程 v＝Vmax[S]/(Km+[S])，其中Km为米氏常数、Vmax为最大反应速度，可用于判断酶与底物的亲和力以及抑制作用类型。',
    topic: '酶',
    note: '2025年简答题考过"写出米氏方程并说明Km的意义"，必须能默写。',
  },
  {
    id: 'biochem-0031',
    subject: 'biochem',
    en: 'Competitive inhibition',
    cn: '竞争性抑制',
    defCn:
      '抑制剂结构与底物相似，与底物竞争酶的活性中心，从而阻碍底物与酶结合的一类可逆抑制。其特点是增大底物浓度可解除抑制，Km增大而Vmax不变。',
    topic: '酶',
    note: '与非竞争性抑制对比记：非竞争性抑制剂的Km不变、Vmax减小，增加底物浓度无法解除。',
  },
  {
    id: 'biochem-0032',
    subject: 'biochem',
    en: 'Feedback inhibition',
    cn: '反馈抑制',
    defCn:
      '代谢途径的终产物反过来抑制该途径中第一个关键酶（通常是限速酶）的活性，从而避免终产物过度积累的调节方式，多属于别构调节。',
    topic: '酶',
    note: '',
  },
  {
    id: 'biochem-0033',
    subject: 'biochem',
    en: 'Rate-limiting enzyme',
    cn: '限速酶',
    defCn:
      '在一条代谢途径中催化反应速度最慢、决定整条途径总速度的酶，通常催化不可逆反应，是代谢调节的主要作用位点，如糖酵解中的磷酸果糖激酶-1。',
    topic: '酶',
    note: '又称关键酶、调节酶。答各代谢途径调节时，写出限速酶是基本得分点。',
  },
  {
    id: 'biochem-0034',
    subject: 'biochem',
    en: 'Specific activity',
    cn: '比活性',
    defCn:
      '每毫克蛋白质所含的酶活力单位数，是衡量酶制剂纯度的指标。在分离纯化过程中，比活性越高说明酶越纯，总蛋白减少而总活力保持则纯化效果好。',
    topic: '酶',
    note: '2023年论述题给出了纯化步骤数据，要求计算各步骤比活性并判断最有效步骤。',
  },
  {
    id: 'biochem-0035',
    subject: 'biochem',
    en: 'Gel filtration',
    cn: '凝胶过滤',
    defCn:
      '又称分子筛层析，利用凝胶颗粒的网孔按分子大小分离蛋白质的技术：大分子不能进入网孔而先流出，小分子可进入网孔而路径长、后流出。',
    topic: '酶',
    note: '2023年论述题问过"凝胶过滤对该酶纯化是否有效，为什么"——关键是分辨它按分子大小而非按活性分离。',
  },
  {
    id: 'biochem-0036',
    subject: 'biochem',
    en: 'Transamination',
    cn: '转氨基作用',
    defCn:
      '在转氨酶催化下，一种氨基酸的α-氨基转移到另一种α-酮酸的酮基上，生成新的氨基酸和新的α-酮酸的反应，是氨基酸分解代谢和合成非必需氨基酸的共同途径。',
    topic: '氨基酸代谢',
    note: '需要磷酸吡哆醛作为辅酶，注意不要与需要四氢叶酸的一碳单位转移混淆（2025年判断题的陷阱）。',
  },
  {
    id: 'biochem-0037',
    subject: 'biochem',
    en: 'Oxidative deamination',
    cn: '氧化脱氨基作用',
    defCn:
      '氨基酸在酶催化下脱去氨基并伴随氧化反应生成α-酮酸和氨的过程，其中谷氨酸脱氢酶催化的反应是可逆的，是体内氨的主要来源。',
    topic: '氨基酸代谢',
    note: '与转氨基作用区分：氧化脱氨基真正释放出游离氨，转氨基只是氨基的转移。',
  },
  {
    id: 'biochem-0038',
    subject: 'biochem',
    en: 'Urea cycle',
    cn: '尿素循环',
    defCn:
      '在肝细胞中进行的、将有毒的氨转变为无毒的尿素并排出体外的循环途径。过程包括氨甲酰磷酸的合成、瓜氨酸与天冬氨酸缩合生成精氨酸代琥珀酸、裂解产生精氨酸，最后精氨酸水解生成尿素和鸟氨酸。',
    topic: '氨基酸代谢',
    note: '2025年判断题涉及"哺乳动物可利用尿素循环解氨毒"。注意其中有两个氨基：一个来自游离氨，一个来自天冬氨酸。',
  },
  {
    id: 'biochem-0039',
    subject: 'biochem',
    en: 'Essential amino acid',
    cn: '必需氨基酸',
    defCn:
      '人体自身不能合成或合成速度不能满足需要，必须由食物蛋白质供给的氨基酸，共有八种（儿童为九种），如赖氨酸、色氨酸、缬氨酸等。',
    topic: '氨基酸代谢',
    note: '与生糖、生酮氨基酸的分类容易混淆，注意区分两套分类体系。',
  },
  {
    id: 'biochem-0040',
    subject: 'biochem',
    en: 'Glucogenic amino acid',
    cn: '生糖氨基酸',
    defCn:
      '在体内分解代谢后其碳骨架可通过丙酮酸或三羧酸循环中间产物转变为葡萄糖的氨基酸，绝大多数氨基酸都属于此类。',
    topic: '氨基酸代谢',
    note: '2024年论述题考过"哪些氨基酸与三羧酸循环中间物有关"。',
  },
  {
    id: 'biochem-0041',
    subject: 'biochem',
    en: 'Ketogenic amino acid',
    cn: '生酮氨基酸',
    defCn:
      '在体内分解代谢后其碳骨架可转变为乙酰乙酸或乙酰CoA、进而生成酮体的氨基酸，包括亮氨酸和赖氨酸，另有部分氨基酸兼具生糖与生酮作用。',
    topic: '氨基酸代谢',
    note: '只生酮的只有亮氨酸和赖氨酸两种，是高频记忆点。',
  },
  {
    id: 'biochem-0042',
    subject: 'biochem',
    en: 'Oxaloacetate',
    cn: '草酰乙酸',
    defCn:
      '三羧酸循环的起始底物和中间产物，由丙酮酸羧化生成，与乙酰CoA缩合生成柠檬酸进入循环，同时也是糖异生的重要前体。',
    topic: '糖类代谢',
    note: '2022年论述题考过"草酰乙酸参与的代谢过程"，需串起三羧酸循环、糖异生和转氨基作用。',
  },
  {
    id: 'biochem-0043',
    subject: 'biochem',
    en: 'Citrate synthase',
    cn: '柠檬酸合酶',
    defCn:
      '催化三羧酸循环第一步反应、即乙酰CoA与草酰乙酸缩合生成柠檬酸和CoA的酶，是三羧酸循环的关键调节位点，其活性受ATP、NADH和柠檬酸抑制。',
    topic: '糖类代谢',
    note: '2023年判断题考过"柠檬酸合酶由底物和中间产物分别诱导的两次构象变化"。',
  },
  {
    id: 'biochem-0044',
    subject: 'biochem',
    en: 'Glycogen phosphorylase',
    cn: '糖原磷酸化酶',
    defCn:
      '催化糖原分子中α-1,4-糖苷键磷酸解、使糖原逐步降解为1-磷酸葡萄糖的酶，是糖原分解的限速酶，受别构调节和可逆磷酸化双重调节。',
    topic: '糖类代谢',
    note: '2023年判断题考过"糖原分解和合成的限速酶及调节方式"。',
  },
  {
    id: 'biochem-0045',
    subject: 'biochem',
    en: 'Cholesterol',
    cn: '胆固醇',
    defCn:
      '环戊烷多氢菲的衍生物，是动物细胞膜的重要组成成分，也是合成胆汁酸、类固醇激素和维生素D3的前体，其合成以乙酰CoA为原料、HMG-CoA还原酶为限速酶。',
    topic: '脂质代谢',
    note: '2025年简答题考过"胆固醇生物合成的四个步骤"。',
  },
  {
    id: 'biochem-0046',
    subject: 'biochem',
    en: 'Fatty acid synthesis',
    cn: '脂肪酸合成',
    defCn:
      '在细胞质中以乙酰CoA为原料、经丙二酰CoA参与、由脂肪酸合酶催化反复进行缩合、还原、脱水、再还原四步反应逐步延长碳链的过程，以NADPH为供氢体、酰基载体蛋白为载体。',
    topic: '脂质代谢',
    note: '2024年论述题要求按场所、辅酶、载体、能量、方向、酶系统六个维度与β-氧化对比，是高频大题。',
  },
  {
    id: 'biochem-0047',
    subject: 'biochem',
    en: 'Blood glucose',
    cn: '血糖',
    defCn:
      '血液中的葡萄糖，正常空腹浓度为3.9～6.1 mmol/L。其来源包括食物消化吸收、肝糖原分解和糖异生，去路包括氧化供能、合成糖原、转变为非糖物质和随尿排出。',
    topic: '糖类代谢',
    note: '2024年简答题考过"血糖的来源和去路及人体如何维持血糖恒定"。',
  },
  {
    id: 'biochem-0048',
    subject: 'biochem',
    en: 'Lipoprotein',
    cn: '脂蛋白',
    defCn:
      '脂质与载脂蛋白结合形成的可溶性复合物，是血浆中脂质的运输形式，按密度由低到高可分为乳糜微粒、极低密度脂蛋白、低密度脂蛋白和高密度脂蛋白四类。',
    topic: '脂质代谢',
    note: '注意低密度脂蛋白与2023年细胞生物学真题中受体介导胞吞的联系。',
  },
  {
    id: 'biochem-0049',
    subject: 'biochem',
    en: 'Adenosine triphosphate',
    cn: '三磷酸腺苷',
    defCn:
      '由腺嘌呤、核糖和三个磷酸基团组成的核苷酸，其末端两个磷酸酐键为高能键，水解时释放约30.5 kJ/mol的自由能，是细胞生命活动直接利用的能量货币。',
    topic: '生物氧化',
    note: '缩写 ATP。注意2023年判断题中"标准自由能变化30.5 kJ/mol"这一数值。',
  },
  {
    id: 'biochem-0050',
    subject: 'biochem',
    en: 'Nicotinamide adenine dinucleotide',
    cn: '烟酰胺腺嘌呤二核苷酸',
    defCn:
      '由烟酰胺和腺嘌呤核苷酸组成的辅酶，作为脱氢酶的辅酶在氧化还原反应中传递氢和电子，其还原形式NADH是呼吸链中重要的电子供体。',
    topic: '生物氧化',
    note: '缩写 NAD+。与NADPH区分：NADH主要参与氧化供能，NADPH主要供还原性合成使用。',
  },
  {
    id: 'biochem-0051',
    subject: 'biochem',
    en: 'Cytochrome',
    cn: '细胞色素',
    defCn:
      '一类以铁卟啉为辅基、通过铁离子的可逆氧化还原传递电子的色素蛋白，按吸收光谱分为a、b、c等几类，在呼吸链中依次排列传递电子。',
    topic: '生物氧化',
    note: '2026年简答题考过"生物氧化还原反应的几种电子载体"，细胞色素是其中之一。',
  },
  {
    id: 'biochem-0052',
    subject: 'biochem',
    en: 'Chemiosmotic hypothesis',
    cn: '化学渗透学说',
    defCn:
      '由米切尔提出的解释氧化磷酸化机制的学说，认为电子沿呼吸链传递时释放的能量将质子从线粒体基质泵到膜间隙，形成跨内膜的质子电化学梯度，该梯度驱动ATP合酶合成ATP。',
    topic: '生物氧化',
    note: '与"结合变构机制"配合回答ATP的合成机制，是论述题的经典组合。',
  },
  {
    id: 'biochem-0053',
    subject: 'biochem',
    en: 'Substrate-level phosphorylation',
    cn: '底物水平磷酸化',
    defCn:
      '在代谢物分子之间直接转移高能磷酸基团、使ADP磷酸化生成ATP的方式，不需要呼吸链和氧参与，如糖酵解中的两次和在三羧酸循环中的一次。',
    topic: '生物氧化',
    note: '与氧化磷酸化对比记：底物水平磷酸化不依赖电子传递链，无氧条件下也能进行。',
  },
  {
    id: 'biochem-0054',
    subject: 'biochem',
    en: 'De novo nucleotide synthesis',
    cn: '核苷酸的从头合成',
    defCn:
      '利用磷酸核糖、氨基酸、一碳单位和二氧化碳等简单物质为原料，经一系列酶促反应逐步合成核苷酸的途径，需消耗大量能量，主要在肝脏进行，与补救合成途径相对。',
    topic: '核苷酸代谢',
    note: '2023年判断题考过"嘌呤核苷酸从头合成的小分子包括二氧化碳、Asp、Glu、Gly和甲酰四氢叶酸"。',
  },
];
