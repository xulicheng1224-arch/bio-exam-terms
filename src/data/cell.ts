/**
 * 661 Cell Biology glossary, curated from the Wuhan University past papers
 * (2022 C, 2023, 2024, 2025, 2026 recalled).
 *
 * Every entry in this file appeared verbatim in a "名词翻译与解释" section.
 * The `topic` field mirrors a chapter title of 丁明孝《细胞生物学》第5版.
 *
 * The explicit `readonly Term[]` annotation makes the compiler prove the shape;
 * cross-entry uniqueness is re-checked at runtime by parseTerms.
 */

import type { Term } from '../types';

export const CELL_TERMS: readonly Term[] = [
  {
    id: 'cell-0001',
    subject: 'cell',
    en: 'Cell theory',
    cn: '细胞学说',
    defCn:
      '由施莱登和施旺提出、后经魏尔肖等人补充的学说，认为细胞是生物体结构和功能的基本单位，一切生物都由细胞发育而来，细胞只能来自已存在的细胞。',
    topic: '绪论',
    note: '',
  },
  {
    id: 'cell-0002',
    subject: 'cell',
    en: 'Fluid mosaic model',
    cn: '流动镶嵌模型',
    defCn:
      '由辛格和尼科尔森提出的质膜结构模型，认为磷脂双分子层构成膜的骨架并具有流动性，蛋白质分子以镶嵌、贯穿或附着的方式不均匀地分布在脂质双分子层中，膜的组分可以侧向扩散。',
    topic: '细胞膜与膜运输',
    note: '与"三夹板模型""单位膜模型"区分：只有流动镶嵌模型强调膜的流动性和蛋白质分布的不对称性。',
  },
  {
    id: 'cell-0003',
    subject: 'cell',
    en: 'Lipid raft',
    cn: '脂筏',
    defCn:
      '质膜上富含胆固醇和鞘磷脂的、排列较为紧密的微区，直径约70～100nm，许多信号分子和膜蛋白在此聚集，是信号转导和膜泡运输的重要平台。',
    topic: '细胞膜与膜运输',
    note: '',
  },
  {
    id: 'cell-0004',
    subject: 'cell',
    en: 'Channel protein',
    cn: '通道蛋白',
    defCn:
      '跨膜蛋白中一类在膜上形成亲水性通道、介导水和某些离子及小分子顺电化学梯度快速跨膜运输的转运蛋白，其转运不与被转运物结合，也不消耗能量。',
    topic: '细胞膜与膜运输',
    note: '与载体蛋白区分：载体蛋白与被转运物结合并发生构象变化，通道蛋白不结合底物、转运速率更高。',
  },
  {
    id: 'cell-0005',
    subject: 'cell',
    en: 'Ion channel-coupled receptor',
    cn: '离子通道偶联受体',
    defCn:
      '又称配体门控离子通道，本身既是受体又是离子通道，配体与受体结合后直接引起通道构象改变而开放，使特定离子顺电化学梯度跨膜流动，从而产生快速的电信号。',
    topic: '细胞信号转导',
    note: '与G蛋白偶联受体区分：离子通道偶联受体的效应器就是通道本身，响应速度快。',
  },
  {
    id: 'cell-0006',
    subject: 'cell',
    en: 'Ligand gated ion channel',
    cn: '配体门控离子通道',
    defCn:
      '由配体与受体结合引起通道蛋白构象变化而开放、使特定离子顺电化学梯度跨膜流动的离子通道，是细胞快速响应外界信号的膜受体类型之一。',
    topic: '细胞信号转导',
    note: '与离子通道偶联受体为同一类结构的两种称法。',
  },
  {
    id: 'cell-0007',
    subject: 'cell',
    en: 'Exocytosis',
    cn: '胞吐',
    defCn:
      '细胞内囊泡与质膜融合，将内含物排出细胞外的物质运输过程，是分泌蛋白、神经递质等释放的主要途径，可分为组成型和调节型两种。',
    topic: '细胞膜与膜运输',
    note: '与胞吞作用方向相反，两者合称膜泡运输。',
  },
  {
    id: 'cell-0008',
    subject: 'cell',
    en: 'Endoplasmic reticulum stress',
    cn: '内质网应激',
    defCn:
      '缺氧、钙稳态失衡、错误折叠或未折叠蛋白在内质网腔中大量堆积等因素导致内质网功能紊乱时，细胞启动的适应性应激反应，可通过未折叠蛋白反应减少蛋白合成、增加分子伴侣并促进降解，应激过强时则诱导细胞凋亡。',
    topic: '内膜系统与蛋白质分选',
    note: '与未折叠蛋白反应区分：内质网应激是整体反应，未折叠蛋白反应是其核心机制。',
  },
  {
    id: 'cell-0009',
    subject: 'cell',
    en: 'Unfolded protein response',
    cn: '未折叠蛋白反应',
    defCn:
      '内质网中未折叠或错误折叠蛋白堆积时，细胞通过抑制蛋白质翻译、上调分子伴侣表达和增强内质网相关降解来恢复内质网稳态的信号通路，持续激活则诱导细胞凋亡。',
    topic: '内膜系统与蛋白质分选',
    note: '',
  },
  {
    id: 'cell-0010',
    subject: 'cell',
    en: 'Trans Golgi network',
    cn: '反面高尔基体网络',
    defCn:
      '位于高尔基体反面的管状囊泡网络结构，是蛋白质和脂质进行分选、包装并运往质膜、分泌泡或溶酶体的主要场所，被认为是高尔基体的"出口分拣站"。',
    topic: '内膜系统与蛋白质分选',
    note: '与顺面高尔基体网络区分：后者位于顺面，负责接受内质网来的运输小泡。',
  },
  {
    id: 'cell-0011',
    subject: 'cell',
    en: 'Nuclear pore complex',
    cn: '核孔复合体',
    defCn:
      '镶嵌在核膜孔上的大型蛋白复合体，由胞质环、核质环、辐和中央栓等结构组成，介导核质之间蛋白质与RNA等大分子的双向选择性运输。',
    topic: '细胞核与染色体',
    note: '',
  },
  {
    id: 'cell-0012',
    subject: 'cell',
    en: 'Nuclear localization signal',
    cn: '核定位信号',
    defCn:
      '蛋白质中一段富含赖氨酸和精氨酸等碱性氨基酸的短肽序列，可被核输入受体识别，引导该蛋白质经核孔复合体主动运输进入细胞核。',
    topic: '细胞核与染色体',
    note: '缩写 NLS。答"名词翻译与解释"时建议写出全称并给出缩写。',
  },
  {
    id: 'cell-0013',
    subject: 'cell',
    en: 'Nucleolus',
    cn: '核仁',
    defCn:
      '细胞核内无界膜包被的球状结构，由纤维中心和致密纤维组分、颗粒组分等构成，是rRNA合成、加工以及核糖体亚基组装的场所。',
    topic: '细胞核与染色体',
    note: '',
  },
  {
    id: 'cell-0014',
    subject: 'cell',
    en: 'Nucleosome',
    cn: '核小体',
    defCn:
      '染色质的基本结构单位，由H2A、H2B、H3、H4各两分子组成的组蛋白八聚体核心，以及缠绕其外约1.75圈、长度约146bp的DNA构成，相邻核小体之间由连接DNA相连。',
    topic: '细胞核与染色体',
    note: '885分子生物学同样考过。与"染色质""染色体"区分：核小体是染色质的一级结构单位。',
  },
  {
    id: 'cell-0015',
    subject: 'cell',
    en: 'Heterochromatin',
    cn: '异染色质',
    defCn:
      '细胞分裂间期仍保持高度凝集、染色较深、转录活性很低或不活泼的染色质，多分布于核周缘，分为组成型异染色质和兼性异染色质两类。',
    topic: '细胞核与染色体',
    note: '2023年与2024年连续考过。与常染色质区分：常染色质松散、染色浅、转录活跃。',
  },
  {
    id: 'cell-0016',
    subject: 'cell',
    en: 'Dynein arm',
    cn: '动力蛋白臂',
    defCn:
      '纤毛和鞭毛轴丝中附着于A亚微管上的动力蛋白复合体，具有ATP酶活性，通过水解ATP驱动相邻二联体微管相对滑动，是纤毛和鞭毛摆动的动力来源。',
    topic: '细胞骨架',
    note: '与肌球蛋白、驱动蛋白区分：动力蛋白沿微管向负极移动，驱动蛋白向正极移动。',
  },
  {
    id: 'cell-0017',
    subject: 'cell',
    en: 'Cyclin',
    cn: '细胞周期蛋白',
    defCn:
      '一类能与细胞周期蛋白依赖性激酶（CDK）结合并调节其活性的蛋白质，其含量随细胞周期时相呈现周期性合成与降解，是细胞周期调控的核心分子。',
    topic: '细胞增殖与细胞周期',
    note: '与CDK区分：CDK含量恒定，Cyclin含量周期性变化，二者结合形成成熟促进因子MPF。',
  },
  {
    id: 'cell-0018',
    subject: 'cell',
    en: 'Kinetochore',
    cn: '动粒',
    defCn:
      '位于染色体着丝粒两侧、由多种蛋白质组成的盘状结构，是纺锤体微管与染色体相连的部位，参与染色体的向极运动和后期染色体分离的调控。',
    topic: '细胞增殖与细胞周期',
    note: '与着丝粒区分：着丝粒是主缢痕处DNA序列和结构，动粒是其两侧的蛋白结构。',
  },
  {
    id: 'cell-0019',
    subject: 'cell',
    en: 'Meiosis',
    cn: '减数分裂',
    defCn:
      '有性生殖细胞形成过程中发生的一种特殊的有丝分裂，DNA只复制一次而细胞连续分裂两次，同源染色体在减数第一次分裂时分离，姐妹染色单体在第二次分裂时分离，最终子细胞染色体数目减半。',
    topic: '细胞增殖与细胞周期',
    note: '与有丝分裂对比记：有丝分裂DNA复制一次、分裂一次，子细胞染色体数与母细胞相同。',
  },
  {
    id: 'cell-0020',
    subject: 'cell',
    en: 'Telomerase',
    cn: '端粒酶',
    defCn:
      '一种由蛋白质和RNA组成的反转录酶，以自身携带的RNA为模板合成端粒重复序列并加在染色体末端，从而延长端粒DNA、补偿复制性末端缩短，使细胞避免复制性衰老。',
    topic: '细胞增殖与细胞周期',
    note: '注意"反转录酶"这一属性是得分点。',
  },
  {
    id: 'cell-0021',
    subject: 'cell',
    en: 'Cell cycle synchronization',
    cn: '细胞周期同步化',
    defCn:
      '采用药物抑制、营养缺乏或温度处理等方法，使培养的细胞群体停留在细胞周期的同一时相，从而获得大量处于相同周期阶段的细胞的技术，常用方法有血清饥饿法、双阻断法、有丝分裂摇落法和低温休克法。',
    topic: '细胞增殖与细胞周期',
    note: '',
  },
  {
    id: 'cell-0022',
    subject: 'cell',
    en: 'Contact inhibition',
    cn: '接触抑制',
    defCn:
      '体外培养的正常细胞分裂增殖到相互接触时，细胞运动和分裂便停止的现象，是正常细胞重要的生长调控特性，癌细胞则失去接触抑制而表现为无限增殖和堆积生长。',
    topic: '癌细胞',
    note: '是判断正常细胞与癌变细胞的经典指标之一。',
  },
  {
    id: 'cell-0023',
    subject: 'cell',
    en: 'Oncogene',
    cn: '癌基因',
    defCn:
      '原癌基因在病毒转导、突变、扩增或染色体易位等因素作用下被异常激活后形成的基因，其表达产物能持续促进细胞增殖、抑制凋亡，从而导致细胞恶性转化和肿瘤发生。',
    topic: '癌细胞',
    note: '与原癌基因区分：原癌基因是正常细胞中存在的、参与正常生长调控的基因；癌基因是其异常激活形式。',
  },
  {
    id: 'cell-0024',
    subject: 'cell',
    en: 'Proto-oncogene',
    cn: '原癌基因',
    defCn:
      '正常细胞基因组中存在的、编码生长因子及其受体、信号转导蛋白、核内转录因子等促进细胞增殖相关蛋白的基因，其产物参与正常的生长分化调控，当发生突变或异常表达时可转变为癌基因。',
    topic: '癌细胞',
    note: '',
  },
  {
    id: 'cell-0025',
    subject: 'cell',
    en: 'Tumor suppressor gene',
    cn: '抑癌基因',
    defCn:
      '正常细胞中存在的、其表达产物能抑制细胞增殖、促进细胞凋亡或参与DNA损伤修复的基因，如p53、Rb，其功能丧失或失活时细胞失去负向调控而易于发生恶性转化。',
    topic: '癌细胞',
    note: '与癌基因区分：癌基因是激活后促进癌变，抑癌基因是失活后导致癌变。',
  },
  {
    id: 'cell-0026',
    subject: 'cell',
    en: 'Cell differentiation',
    cn: '细胞分化',
    defCn:
      '同一来源的细胞在形态结构、生理功能和生化特征上逐渐产生稳定差异、形成不同细胞类型的过程，其本质是基因的选择性表达，具有稳定性、可逆性和普遍性。',
    topic: '细胞分化',
    note: '',
  },
  {
    id: 'cell-0027',
    subject: 'cell',
    en: 'Housekeeping gene',
    cn: '管家基因',
    defCn:
      '在所有细胞的各个发育阶段都持续表达、其表达产物为维持细胞基本生命活动所必需的基因，如编码核糖体蛋白、糖酵解酶的基因，其表达受环境因素影响较小。',
    topic: '细胞分化',
    note: '2022年与2026年都考过。与组织特异性基因（奢侈基因）相对。',
  },
  {
    id: 'cell-0028',
    subject: 'cell',
    en: 'Tissue-specific gene',
    cn: '组织特异性基因',
    defCn:
      '又称奢侈基因，只在某种特定类型的细胞中表达，其表达产物赋予该种细胞特定的形态结构和生理功能的基因，如红细胞的血红蛋白基因。',
    topic: '细胞分化',
    note: '与管家基因相对，是细胞分化研究的重要对象。',
  },
  {
    id: 'cell-0029',
    subject: 'cell',
    en: 'Apoptosis',
    cn: '细胞凋亡',
    defCn:
      '由基因控制的细胞自主的、有序的程序性死亡过程，表现为细胞皱缩、染色质固缩边集、DNA被降解成片段、形成凋亡小体，最终被邻近细胞吞噬，不引起炎症反应。',
    topic: '细胞衰老与死亡',
    note: '与细胞坏死对比记：凋亡是主动、程序性、不引起炎症；坏死是被动、膜破裂、引起炎症。',
  },
  {
    id: 'cell-0030',
    subject: 'cell',
    en: 'Programmed cell death',
    cn: '程序性细胞死亡',
    defCn:
      '由基因控制的细胞自主的、有序的死亡方式，是机体在发育过程中清除多余细胞、维持内环境稳定和防御的重要机制，细胞凋亡是其最主要的类型。',
    topic: '细胞衰老与死亡',
    note: '与细胞凋亡的关系：细胞凋亡是程序性细胞死亡的主要形式，但程序性细胞死亡不限于凋亡。',
  },
  {
    id: 'cell-0031',
    subject: 'cell',
    en: 'Apoptotic body',
    cn: '凋亡小体',
    defCn:
      '细胞凋亡后期，细胞质膜内陷并将细胞内容物（包括核碎片和细胞器）包裹形成的膜包围小体，可被邻近细胞或巨噬细胞识别并吞噬清除，因而不引起炎症反应。',
    topic: '细胞衰老与死亡',
    note: '',
  },
  {
    id: 'cell-0032',
    subject: 'cell',
    en: 'Stem cell niche',
    cn: '干细胞巢',
    defCn:
      '体内维持干细胞自我更新能力并调控其分化方向的特定微环境，由周围的支持细胞、细胞外基质以及多种信号分子共同构成，为干细胞提供生存和增殖的场所与信号。',
    topic: '干细胞',
    note: '与"微环境"同义，答全"niche"的含义是得分点。',
  },
  {
    id: 'cell-0033',
    subject: 'cell',
    en: 'Induced pluripotent stem cell',
    cn: '诱导多能干细胞',
    defCn:
      '通过向体细胞中导入Oct4、Sox2、Klf4、c-Myc四种转录因子，使其重编程而获得的具有类似胚胎干细胞多向分化潜能的干细胞，简称iPS细胞。',
    topic: '干细胞',
    note: '2026年考"Induced pluripotent stem cells"。答出四种转录因子是得分点。',
  },
  {
    id: 'cell-0034',
    subject: 'cell',
    en: 'Chemically induced pluripotent stem cell',
    cn: '化学诱导多能干细胞',
    defCn:
      '完全用小分子化合物组合处理体细胞，通过调控多条信号通路使其重编程为多能性状态的干细胞，避免了外源基因导入带来的安全性问题。',
    topic: '干细胞',
    note: '与iPS细胞区分：iPS靠导入转录因子，CiPS靠小分子化合物。',
  },
  {
    id: 'cell-0035',
    subject: 'cell',
    en: 'Signal transduction',
    cn: '信号转导',
    defCn:
      '细胞通过膜上或胞内受体识别外界信号分子，经胞内一系列信号传递蛋白的转换、传递和逐级放大，最终引起基因表达改变或酶活性变化等特定生物学效应的过程。',
    topic: '细胞信号转导',
    note: '',
  },
  {
    id: 'cell-0036',
    subject: 'cell',
    en: 'G protein-coupled receptor',
    cn: 'G蛋白偶联受体',
    defCn:
      '由一条多肽链七次跨膜形成的受体家族，其胞内区与G蛋白偶联，配体结合后激活G蛋白，进而调节腺苷酸环化酶、磷脂酶C等效应器的活性或离子通道的开闭。',
    topic: '细胞信号转导',
    note: '缩写 GPCR。与离子通道偶联受体、酶偶联受体并列为三类主要膜受体。',
  },
  {
    id: 'cell-0037',
    subject: 'cell',
    en: 'Second messenger',
    cn: '第二信使',
    defCn:
      '细胞接受第一信使（胞外信号分子）后，在细胞内产生的、负责将信号传递和放大的小分子物质，如cAMP、cGMP、IP3、DAG和Ca2+等。',
    topic: '细胞信号转导',
    note: '与第一信使区分：第一信使是胞外信号分子（如激素、神经递质）。',
  },
  {
    id: 'cell-0038',
    subject: 'cell',
    en: 'Autocrine',
    cn: '自分泌',
    defCn:
      '细胞分泌的信号分子作用于自身细胞表面的受体，从而对自身生长、增殖或分化进行调节的一种信号传递方式，肿瘤细胞常通过自分泌维持自主性增殖。',
    topic: '细胞信号转导',
    note: '与旁分泌、内分泌并列，区别在于靶细胞是自身。',
  },
  {
    id: 'cell-0039',
    subject: 'cell',
    en: 'Molecular switches',
    cn: '分子开关',
    defCn:
      '细胞内能够在"开"与"关"两种活性状态之间可逆转换、从而调控信号通路和细胞活动的蛋白质，主要有两类机制：蛋白质的磷酸化与去磷酸化，以及GTP结合蛋白的GTP结合与水解。',
    topic: '细胞信号转导',
    note: '',
  },
  {
    id: 'cell-0040',
    subject: 'cell',
    en: 'Gap junction',
    cn: '间隙连接',
    defCn:
      '由六个连接蛋白围成中空通道、相邻细胞质膜上通道对接形成的细胞间连接，允许离子和小分子代谢物直接在细胞间通过，实现细胞间的电信号和化学信号通讯。',
    topic: '细胞连接',
    note: '与紧密连接区分：间隙连接是通讯连接，紧密连接是封闭连接。',
  },
  {
    id: 'cell-0041',
    subject: 'cell',
    en: 'Tight junction',
    cn: '紧密连接',
    defCn:
      '相邻细胞质膜局部紧密靠拢形成的封闭连接，由跨膜蛋白（如闭合蛋白、封闭蛋白）在细胞间隙中直接相连，具有封闭细胞间隙、阻止物质自由穿行和维持细胞极性、构成屏障的作用。',
    topic: '细胞连接',
    note: '',
  },
  {
    id: 'cell-0042',
    subject: 'cell',
    en: 'Communicating junction',
    cn: '通讯连接',
    defCn:
      '相邻细胞间能够直接进行物质交换和信号传递的细胞连接方式，动物细胞中主要为间隙连接，植物细胞中为胞间连丝。',
    topic: '细胞连接',
    note: '与锚定连接、封闭连接并列为三类细胞连接。',
  },
  {
    id: 'cell-0043',
    subject: 'cell',
    en: 'Fluorescence in situ hybridization',
    cn: '荧光原位杂交',
    defCn:
      '用荧光素标记的核酸探针与染色体或细胞中的特定核酸序列按碱基互补原则杂交，再通过荧光显微镜观察荧光信号位置，从而对目标序列进行定位和定量分析的技术。',
    topic: '研究方法与技术',
    note: '缩写 FISH。2022年卷面写的是 "Fluorescence in situ hybridization technology"。',
  },
  {
    id: 'cell-0044',
    subject: 'cell',
    en: 'Cryo-electron microscopy',
    cn: '冷冻电镜技术',
    defCn:
      '将生物样品快速冷冻使其在玻璃态冰中保持天然构象，再用透射电子显微镜成像并借助图像处理重构三维密度图，从而解析生物大分子高分辨率结构的技术。',
    topic: '研究方法与技术',
    note: '与X射线晶体衍射、核磁共振并列为结构生物学的三大手段。',
  },
];
