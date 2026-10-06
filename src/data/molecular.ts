/**
 * 885 Molecular Biology glossary, curated from the Wuhan University past papers
 * (2022 A, 2023 D, 2024, 2025, 2026 recalled).
 *
 * Every entry appeared verbatim in a "名词翻译与解释" section. The `topic` field
 * mirrors a chapter title of 朱玉贤《现代分子生物学》第6版.
 */

import type { Term } from '../types';

export const MOLECULAR_TERMS: readonly Term[] = [
  {
    id: 'mol-0001',
    subject: 'molecular',
    en: 'Central Dogma',
    cn: '中心法则',
    defCn:
      '由克里克提出的、描述遗传信息传递方向的基本法则，即遗传信息从DNA流向RNA再流向蛋白质；后来补充了RNA向DNA的反转录以及RNA向RNA的复制，使其更加完整。',
    topic: '绪论',
    note: '',
  },
  {
    id: 'mol-0002',
    subject: 'molecular',
    en: 'Genome',
    cn: '基因组',
    defCn:
      '一个生物体所携带的全部遗传信息的总和，即其全部DNA序列（RNA病毒则为全部RNA序列），包括编码序列和非编码序列。',
    topic: '染色体与DNA',
    note: '',
  },
  {
    id: 'mol-0003',
    subject: 'molecular',
    en: 'Chromosome',
    cn: '染色体',
    defCn:
      '真核细胞分裂期由DNA和蛋白质高度折叠形成的、可被碱性染料着色的棒状结构，是遗传物质的主要载体，由着丝粒、端粒、复制起点等结构要素构成。',
    topic: '染色体与DNA',
    note: '与染色质区分：染色体是分裂期高度折叠的形态，染色质是间期的存在形式，二者是同种物质的不同状态。',
  },
  {
    id: 'mol-0004',
    subject: 'molecular',
    en: 'Chromatin',
    cn: '染色质',
    defCn:
      '细胞分裂间期细胞核内由DNA、组蛋白、非组蛋白及少量RNA组成的复合物，呈细丝状，分为常染色质和异染色质两类。',
    topic: '染色体与DNA',
    note: '',
  },
  {
    id: 'mol-0005',
    subject: 'molecular',
    en: 'Nucleosome',
    cn: '核小体',
    defCn:
      '染色质的基本结构单位，由H2A、H2B、H3、H4各两分子构成的组蛋白八聚体核心，以及缠绕其外约1.75圈、长约146bp的DNA组成，彼此由连接DNA相连。',
    topic: '染色体与DNA',
    note: '661细胞生物学也考过。若两科同时考，注意分值不同（细胞3分、分子4分），释义详略可相应调整。',
  },
  {
    id: 'mol-0006',
    subject: 'molecular',
    en: 'DNA Replication',
    cn: 'DNA复制',
    defCn:
      '以亲代DNA分子为模板合成子代DNA的过程，具有半保留复制、双向复制和半不连续复制三大特点，需要模板、底物、引物、多种酶和蛋白因子的参与。',
    topic: '染色体与DNA',
    note: '',
  },
  {
    id: 'mol-0007',
    subject: 'molecular',
    en: 'Semiconservative replication',
    cn: '半保留复制',
    defCn:
      'DNA复制时双螺旋解开，每条母链各自作为模板合成互补的新链，形成的两个子代DNA分子中各保留一条亲代链和一条新合成的链。',
    topic: '染色体与DNA',
    note: '由Meselson-Stahl密度梯度离心实验证明。',
  },
  {
    id: 'mol-0008',
    subject: 'molecular',
    en: 'Origin of Replication',
    cn: '复制起点',
    defCn:
      'DNA分子上复制起始的特定核苷酸序列，原核生物染色体只有一个复制起点（oriC），真核生物染色体上有多个复制起点，可同时启动复制以提高复制效率。',
    topic: '染色体与DNA',
    note: '',
  },
  {
    id: 'mol-0009',
    subject: 'molecular',
    en: 'Lagging strand',
    cn: '后随链',
    defCn:
      'DNA半不连续复制中，以5\'→3\'方向、与复制叉前进方向相反合成的子链，只能先合成若干不连续的冈崎片段，再由DNA连接酶连接成完整的新链。',
    topic: '染色体与DNA',
    note: '与前导链区分：前导链连续合成，后随链不连续合成。',
  },
  {
    id: 'mol-0010',
    subject: 'molecular',
    en: 'Okazaki fragments',
    cn: '冈崎片段',
    defCn:
      'DNA不连续复制过程中在后随链上合成的不连续短DNA片段，原核生物长约1000～2000个核苷酸，真核生物长约100～200个核苷酸，随后由DNA连接酶连接成完整链。',
    topic: '染色体与DNA',
    note: '',
  },
  {
    id: 'mol-0011',
    subject: 'molecular',
    en: 'Topoisomerase',
    cn: '拓扑异构酶',
    defCn:
      '通过切断DNA的一条链或两条链并重新连接，改变DNA分子的拓扑构象、消除复制和转录过程中产生的正超螺旋张力的酶，分Ⅰ型和Ⅱ型两类。',
    topic: '染色体与DNA',
    note: '与解旋酶区分：解旋酶破坏碱基对间的氢键使双链解开，拓扑异构酶切断并重接磷酸二酯键释放张力。',
  },
  {
    id: 'mol-0012',
    subject: 'molecular',
    en: 'DNA ligase',
    cn: 'DNA连接酶',
    defCn:
      '催化一个DNA链的3\'-羟基末端与另一个DNA链的5\'-磷酸基团之间形成磷酸二酯键，从而把两个DNA片段共价连接起来的酶，是复制和基因工程中的关键工具酶。',
    topic: '染色体与DNA',
    note: '在细胞内负责封闭复制产生的缺口和连接冈崎片段。',
  },
  {
    id: 'mol-0013',
    subject: 'molecular',
    en: 'cccDNA',
    cn: '共价闭合环状DNA',
    defCn:
      '两条链均无缺口、以共价键形成闭环的双链环状DNA分子，如质粒和乙肝病毒基因组，其超螺旋结构使其在电泳中迁移速率与同分子量线性DNA不同。',
    topic: '染色体与DNA',
    note: '全称 covalently closed circular DNA，答题时应写出全称并说明与开环、线性DNA的区别。',
  },
  {
    id: 'mol-0014',
    subject: 'molecular',
    en: 'DNA methylation',
    cn: 'DNA甲基化',
    defCn:
      '在DNA甲基转移酶催化下，S-腺苷甲硫氨酸提供甲基，使胞嘧啶第5位碳原子发生共价修饰生成5-甲基胞嘧啶的过程，主要发生在CpG岛，通常与基因转录抑制和基因组稳定性维持有关。',
    topic: '基因表达调控',
    note: '',
  },
  {
    id: 'mol-0015',
    subject: 'molecular',
    en: 'Histone Modification',
    cn: '组蛋白修饰',
    defCn:
      '组蛋白N端尾部氨基酸残基发生的乙酰化、甲基化、磷酸化、泛素化等共价修饰，通过改变染色质的疏松程度和募集调控蛋白，在转录调控、DNA修复等过程中发挥重要作用。',
    topic: '基因表达调控',
    note: '与DNA甲基化共同构成表观遗传修饰的两大主要内容。',
  },
  {
    id: 'mol-0016',
    subject: 'molecular',
    en: 'Base flipping',
    cn: '碱基翻转',
    defCn:
      'DNA修饰酶或修复酶识别特定碱基后，使该碱基从双螺旋内部翻转出来进入酶的活性中心的构象变化，使酶能够直接接触并修饰或切除该碱基。',
    topic: '基因表达调控',
    note: 'DNA甲基转移酶和DNA糖苷酶都采用这一机制。',
  },
  {
    id: 'mol-0017',
    subject: 'molecular',
    en: 'Promoter',
    cn: '启动子',
    defCn:
      '位于基因转录起始位点上游、能被RNA聚合酶及转录因子识别和特异性结合的DNA序列，决定转录的起始位点和转录效率，原核生物还有-10区和-35区等保守序列。',
    topic: '转录与转录调控',
    note: '与增强子区分：启动子决定转录起点、位于基因上游且方向固定；增强子不决定起点、位置和方向均可变。',
  },
  {
    id: 'mol-0018',
    subject: 'molecular',
    en: 'Enhancer',
    cn: '增强子',
    defCn:
      '位于基因上游或下游、甚至内含子中，与启动子相距较远但仍能显著提高该基因转录效率的DNA序列，其作用与所处位置和取向无关，通过结合特异转录因子发挥作用。',
    topic: '转录与转录调控',
    note: '',
  },
  {
    id: 'mol-0019',
    subject: 'molecular',
    en: 'RNA polymerase',
    cn: 'RNA聚合酶',
    defCn:
      '以DNA为模板，按碱基互补配对原则催化四种核糖核苷三磷酸聚合形成RNA的酶，能直接起始RNA链的合成而无需引物，真核生物有Ⅰ、Ⅱ、Ⅲ三种。',
    topic: '转录与转录调控',
    note: '与DNA聚合酶区分：RNA聚合酶不需要引物，且具有模板识别、起始、延伸和终止的完整功能。',
  },
  {
    id: 'mol-0020',
    subject: 'molecular',
    en: 'Transcriptional factor',
    cn: '转录因子',
    defCn:
      '能与基因启动子或增强子中的特定DNA序列专一性结合，从而激活或抑制该基因转录的蛋白质，包括通用转录因子和特异转录因子两类。',
    topic: '转录与转录调控',
    note: '',
  },
  {
    id: 'mol-0021',
    subject: 'molecular',
    en: 'Zinc finger protein',
    cn: '锌指蛋白',
    defCn:
      '含有一个或多个由锌离子与半胱氨酸和组氨酸残基配位形成的指状结构域的蛋白质，该结构域能插入DNA双螺旋的大沟与特定序列结合，是最常见的真核转录因子结构类型之一。',
    topic: '转录与转录调控',
    note: '',
  },
  {
    id: 'mol-0022',
    subject: 'molecular',
    en: 'Operon',
    cn: '操纵子',
    defCn:
      '原核生物中功能相关的若干结构基因连同其上游的启动子、操纵基因等调控序列共同组成的转录单位，转录出一条多顺反子mRNA，如乳糖操纵子和色氨酸操纵子。',
    topic: '转录与转录调控',
    note: '与"基因"区分：操纵子是一个转录调控单元，可包含多个结构基因。',
  },
  {
    id: 'mol-0023',
    subject: 'molecular',
    en: 'Corepressor',
    cn: '辅阻遏物',
    defCn:
      '本身不能直接结合DNA，需与阻遏蛋白结合并使其构象改变后，才能识别并结合操纵基因从而阻断转录的小分子或蛋白质，如色氨酸操纵子中的色氨酸。',
    topic: '转录与转录调控',
    note: '与诱导物区分：辅阻遏物增强阻遏蛋白与操纵基因的结合（关闭转录），诱导物则使其脱离（开启转录）。',
  },
  {
    id: 'mol-0024',
    subject: 'molecular',
    en: 'Ribosome',
    cn: '核糖体',
    defCn:
      '由rRNA和蛋白质组成的核糖核蛋白颗粒，是细胞内蛋白质合成的场所，由大小两个亚基构成，含有A位点、P位点和E位点三个与tRNA结合的位点。',
    topic: '翻译',
    note: '',
  },
  {
    id: 'mol-0025',
    subject: 'molecular',
    en: 'Shine-Dalgarno sequence',
    cn: 'SD序列',
    defCn:
      '原核生物mRNA起始密码子上游约8～13个核苷酸处的一段富含嘌呤的保守序列，能与16S rRNA 3\'端互补配对，使核糖体小亚基正确定位到起始密码子处起始翻译。',
    topic: '翻译',
    note: '真核生物中与之功能对应的是5\'帽子结构引导的扫描机制。',
  },
  {
    id: 'mol-0026',
    subject: 'molecular',
    en: 'Cognate tRNAs',
    cn: '同源tRNA',
    defCn:
      '反密码子能与某一特定密码子通过碱基互补配对、并携带与该密码子所编码氨基酸相对应的tRNA，是保证遗传信息准确翻译的关键分子。',
    topic: '翻译',
    note: '',
  },
  {
    id: 'mol-0027',
    subject: 'molecular',
    en: 'Nonsense codon',
    cn: '无义密码子',
    defCn:
      '又称终止密码子，即UAA、UAG和UGA三个密码子，不编码任何氨基酸，而是被释放因子识别，终止多肽链的合成并使新生肽链从核糖体上释放。',
    topic: '翻译',
    note: '与起始密码子AUG区分。',
  },
  {
    id: 'mol-0028',
    subject: 'molecular',
    en: 'Nonsense mutation',
    cn: '无义突变',
    defCn:
      '编码氨基酸的密码子因碱基替换而突变为终止密码子，导致多肽链在突变位点提前终止合成，产生无功能或功能不全的截短蛋白质的突变。',
    topic: '基因突变与修复',
    note: '与错义突变、同义突变并列，注意区分三者对蛋白质的影响程度。',
  },
  {
    id: 'mol-0029',
    subject: 'molecular',
    en: 'Frameshift mutation',
    cn: '移码突变',
    defCn:
      'DNA分子中插入或缺失的核苷酸数目不是3的整数倍时，引起突变位点之后阅读框发生改变，使编码的氨基酸序列大幅变化并常提前出现终止密码子的突变。',
    topic: '基因突变与修复',
    note: '',
  },
  {
    id: 'mol-0030',
    subject: 'molecular',
    en: 'Open reading frame',
    cn: '开放阅读框',
    defCn:
      '从起始密码子开始到终止密码子结束、中间不被终止密码子打断、理论上可连续编码一段多肽链的核苷酸序列，常缩写为ORF。',
    topic: '基因突变与修复',
    note: '',
  },
  {
    id: 'mol-0031',
    subject: 'molecular',
    en: 'Exons',
    cn: '外显子',
    defCn:
      '真核生物断裂基因中存在于成熟mRNA分子上的序列，既包括编码蛋白质的序列，也包括5\'端和3\'端的非翻译区。',
    topic: '基因表达调控',
    note: '与内含子区分：内含子在mRNA成熟加工过程中被剪接切除。',
  },
  {
    id: 'mol-0032',
    subject: 'molecular',
    en: 'Alternative splicing',
    cn: '可变剪接',
    defCn:
      '同一前体mRNA通过选择不同的剪接位点组合，产生多种不同成熟mRNA、进而翻译出不同蛋白质异构体的过程，是真核生物基因表达调控和蛋白质多样性的重要机制。',
    topic: '基因表达调控',
    note: '2023年真题中以人载脂蛋白B的两种形式为例考察。',
  },
  {
    id: 'mol-0033',
    subject: 'molecular',
    en: 'Branch site',
    cn: '分支点',
    defCn:
      '真核生物前体mRNA内含子中靠近3\'剪接位点的一段保守序列，其中腺苷酸的2\'-羟基在剪接第一步中亲核攻击5\'剪接位点，形成套索状中间体。',
    topic: '基因表达调控',
    note: '记忆剪接过程时，分支点腺苷酸的2\'-OH是关键。',
  },
  {
    id: 'mol-0034',
    subject: 'molecular',
    en: 'RNA editing',
    cn: 'RNA编辑',
    defCn:
      '转录后RNA分子上发生核苷酸的插入、缺失或替换，使成熟RNA的序列与DNA模板不完全一致，从而产生与基因序列不完全对应的蛋白质的现象。',
    topic: '基因表达调控',
    note: '与RNA剪接区分：剪接是切除内含子连接外显子，编辑是改变单个核苷酸。',
  },
  {
    id: 'mol-0035',
    subject: 'molecular',
    en: 'LncRNA',
    cn: '长链非编码RNA',
    defCn:
      '长度超过200个核苷酸、本身不编码蛋白质的RNA分子，可在转录水平、转录后水平和表观遗传水平通过多种机制调控基因表达，如Xist参与X染色体失活。',
    topic: '基因表达调控',
    note: '全称 long non-coding RNA，与miRNA、siRNA等小非编码RNA区分。',
  },
  {
    id: 'mol-0036',
    subject: 'molecular',
    en: 'RNAi',
    cn: 'RNA干扰',
    defCn:
      '由双链RNA引发的、经Dicer切割生成siRNA并组装成RISC复合体，进而特异性降解同源mRNA或抑制其翻译，使相应基因表达沉默的现象，广泛用于基因功能研究。',
    topic: '研究技术与方法',
    note: '',
  },
  {
    id: 'mol-0037',
    subject: 'molecular',
    en: 'RISC',
    cn: 'RNA诱导沉默复合体',
    defCn:
      'RNA干扰途径中由Argonaute蛋白和siRNA或miRNA组装形成的核糖核蛋白复合体，其中siRNA引导复合体通过碱基互补识别靶mRNA，并对其进行切割或抑制翻译。',
    topic: '研究技术与方法',
    note: '全称 RNA-induced silencing complex，是RNAi的效应器。',
  },
  {
    id: 'mol-0038',
    subject: 'molecular',
    en: 'Restriction enzyme',
    cn: '限制性内切酶',
    defCn:
      '识别双链DNA分子中特定的核苷酸序列（多为4～8bp的回文序列）并在该位点切断磷酸二酯键的酶，是基因工程中切割DNA、构建重组体的基本工具酶。',
    topic: '研究技术与方法',
    note: '',
  },
  {
    id: 'mol-0039',
    subject: 'molecular',
    en: 'Recombinant DNA Technology',
    cn: '重组DNA技术',
    defCn:
      '又称基因工程，指在体外用限制性内切酶切割DNA、用DNA连接酶将不同来源的DNA片段连接成重组分子，再导入宿主细胞中进行复制和表达的技术。',
    topic: '研究技术与方法',
    note: '',
  },
  {
    id: 'mol-0040',
    subject: 'molecular',
    en: 'CRISPR',
    cn: '成簇规律间隔短回文重复序列',
    defCn:
      '原核生物基因组中由短重复序列和间隔序列交替组成的结构，与Cas蛋白配合可识别并切割外源核酸，构成细菌的适应性免疫系统，现已被改造为高效、精准的基因编辑工具。',
    topic: '研究技术与方法',
    note: '全称 clustered regularly interspaced short palindromic repeats。考法上常要求说明Cas9的切割机制。',
  },
  {
    id: 'mol-0041',
    subject: 'molecular',
    en: 'Nested PCR',
    cn: '巢式PCR',
    defCn:
      '先后用两对引物进行两轮PCR扩增，第一轮扩增的产物作为第二轮扩增模板，第二轮引物位于第一轮扩增片段内部，从而显著提高反应特异性和灵敏度的技术。',
    topic: '研究技术与方法',
    note: '与普通PCR的区别在于引物对被使用两次、扩增片段嵌套。',
  },
  {
    id: 'mol-0042',
    subject: 'molecular',
    en: 'Western blot',
    cn: '蛋白质免疫印迹',
    defCn:
      '将蛋白质样品经凝胶电泳按分子量分离后转移到固相膜上，再用特异性抗体与之结合并通过显色或发光进行检测的技术，可用于分析蛋白质的表达水平和分子量。',
    topic: '研究技术与方法',
    note: '与Southern blot（检测DNA）、Northern blot（检测RNA）区分。',
  },
  {
    id: 'mol-0043',
    subject: 'molecular',
    en: 'Gel electrophoresis',
    cn: '凝胶电泳',
    defCn:
      '带电的核酸或蛋白质分子在电场作用下通过凝胶介质泳动，因其所带电荷、分子大小和构象不同而迁移速率不同，从而实现分离和鉴定的技术。',
    topic: '研究技术与方法',
    note: '',
  },
  {
    id: 'mol-0044',
    subject: 'molecular',
    en: 'RNA immunoprecipitation',
    cn: 'RNA免疫沉淀',
    defCn:
      '利用针对特定RNA结合蛋白的特异性抗体将蛋白与与之结合的RNA共同沉淀下来，再通过测序或定量PCR鉴定这些RNA，从而研究RNA与蛋白质相互作用的技术。',
    topic: '研究技术与方法',
    note: '与ChIP区分：ChIP沉淀的是与蛋白结合的DNA，RIP沉淀的是RNA。',
  },
  {
    id: 'mol-0045',
    subject: 'molecular',
    en: 'Proteomics',
    cn: '蛋白质组学',
    defCn:
      '在整体水平上研究特定细胞、组织或生物体所表达的全部蛋白质的组成、表达水平、翻译后修饰以及相互作用网络的学科，主要技术手段为双向电泳和质谱。',
    topic: '研究技术与方法',
    note: '',
  },
  {
    id: 'mol-0046',
    subject: 'molecular',
    en: 'Synonyms',
    cn: '同义密码子',
    defCn:
      '编码同一种氨基酸的多个不同密码子，其差别多位于第三位碱基，体现了遗传密码的简并性，可降低突变对蛋白质结构的影响。',
    topic: '翻译',
    note: '2023年真题卷面写作 "Synonyms"，规范写法为 synonymous codons，答题时建议写全。',
  },
];
