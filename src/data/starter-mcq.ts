import {
  hscBotanyExamChapters,
  hscZoologyExamChapters,
  sscExamChapters,
  type AnswerOption,
  type ExamConfig,
  type ExamLevel,
  type ExamSubject,
  type QuestionDifficulty,
} from './exam';

type Concept = {
  id: string;
  label: string;
  definition: string;
  explanation: string;
};

type ChapterSeed = {
  level: ExamLevel;
  subject: ExamSubject;
  chapterName: string;
  concepts: Concept[];
};

export type StarterMcqQuestion = {
  id: string;
  level: ExamLevel;
  subject: ExamSubject;
  testType: 'chapter_wise';
  chapterName: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: AnswerOption;
  explanation: string;
  difficulty: QuestionDifficulty;
  status: 'active';
  createdAt: number;
  updatedAt: number;
};

const difficultyByVariant: QuestionDifficulty[] = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard'];
const promptTemplates = [
  (chapterTitle: string, definition: string) => `In ${chapterTitle}, which term matches this description: ${definition}`,
  (_chapterTitle: string, definition: string) => `Which biological term is correctly described as: ${definition}`,
  (chapterTitle: string, definition: string) => `${chapterTitle}: choose the best concept for this statement - ${definition}`,
  (_chapterTitle: string, definition: string) => `Select the correct answer for the statement: ${definition}`,
  (chapterTitle: string, definition: string) => `Which key idea from ${chapterTitle} is represented by: ${definition}`,
];

const sscConceptBanks: Concept[][] = [
  [
    { id: 'biology', label: 'Biology', definition: 'the scientific study of living organisms', explanation: 'Biology studies living organisms and their life processes.' },
    { id: 'organism', label: 'Organism', definition: 'an individual living thing', explanation: 'An organism is any individual living being.' },
    { id: 'cell', label: 'Cell', definition: 'the basic structural and functional unit of life', explanation: 'Cells are the smallest units that perform life functions.' },
    { id: 'biodiversity', label: 'Biodiversity', definition: 'the variety of living organisms in an area', explanation: 'Biodiversity means variation among living organisms.' },
    { id: 'habitat', label: 'Habitat', definition: 'the natural place where an organism lives', explanation: 'A habitat provides the environment needed for survival.' },
  ],
  [
    { id: 'nucleus', label: 'Nucleus', definition: 'the cell organelle that controls activities and contains genetic material', explanation: 'The nucleus directs cell activities and stores DNA.' },
    { id: 'cytoplasm', label: 'Cytoplasm', definition: 'the jelly-like material where many cell reactions occur', explanation: 'Cytoplasm holds organelles and supports many reactions.' },
    { id: 'tissue', label: 'Tissue', definition: 'a group of similar cells performing a common function', explanation: 'Similar cells working together form a tissue.' },
    { id: 'xylem', label: 'Xylem', definition: 'plant tissue that transports water and minerals upward', explanation: 'Xylem carries water and minerals from roots to shoots.' },
    { id: 'phloem', label: 'Phloem', definition: 'plant tissue that transports prepared food', explanation: 'Phloem distributes food made in leaves.' },
  ],
  [
    { id: 'mitosis', label: 'Mitosis', definition: 'cell division that produces two genetically identical daughter cells', explanation: 'Mitosis maintains chromosome number and supports growth.' },
    { id: 'meiosis', label: 'Meiosis', definition: 'cell division that halves chromosome number to form gametes', explanation: 'Meiosis forms haploid gametes for sexual reproduction.' },
    { id: 'chromosome', label: 'Chromosome', definition: 'a DNA-containing structure carrying hereditary information', explanation: 'Chromosomes contain genes made of DNA.' },
    { id: 'spindle', label: 'Spindle Fiber', definition: 'a fiber that helps separate chromosomes during cell division', explanation: 'Spindle fibers move chromosomes to opposite poles.' },
    { id: 'cytokinesis', label: 'Cytokinesis', definition: 'division of the cytoplasm after nuclear division', explanation: 'Cytokinesis separates one cell into two daughter cells.' },
  ],
  [
    { id: 'photosynthesis', label: 'Photosynthesis', definition: 'the process by which green plants make food using light', explanation: 'Photosynthesis converts light energy into chemical energy.' },
    { id: 'chlorophyll', label: 'Chlorophyll', definition: 'the green pigment that captures light energy', explanation: 'Chlorophyll absorbs light for photosynthesis.' },
    { id: 'respiration', label: 'Respiration', definition: 'the process that releases energy from food', explanation: 'Respiration breaks down food to release usable energy.' },
    { id: 'atp', label: 'ATP', definition: 'the immediate energy currency of the cell', explanation: 'ATP stores and transfers usable cellular energy.' },
    { id: 'stomata', label: 'Stomata', definition: 'tiny leaf pores used for gas exchange', explanation: 'Stomata allow carbon dioxide entry and water vapor exit.' },
  ],
  [
    { id: 'carbohydrate', label: 'Carbohydrate', definition: 'the main energy-giving nutrient', explanation: 'Carbohydrates are a major source of dietary energy.' },
    { id: 'protein', label: 'Protein', definition: 'the nutrient mainly needed for growth and tissue repair', explanation: 'Proteins build and repair body tissues.' },
    { id: 'enzyme', label: 'Enzyme', definition: 'a biological catalyst that speeds digestion', explanation: 'Digestive enzymes accelerate food breakdown.' },
    { id: 'intestine', label: 'Small Intestine', definition: 'the main site of digested food absorption', explanation: 'Most nutrient absorption occurs in the small intestine.' },
    { id: 'balanced-diet', label: 'Balanced Diet', definition: 'a diet containing all nutrients in proper amounts', explanation: 'A balanced diet supplies nutrients in correct proportions.' },
  ],
];

const botanyConceptBanks: Concept[][] = [
  [
    { id: 'cell-wall', label: 'Cell Wall', definition: 'a rigid outer layer that supports plant cells', explanation: 'The plant cell wall provides shape and support.' },
    { id: 'membrane', label: 'Plasma Membrane', definition: 'a selectively permeable boundary of the cell', explanation: 'The plasma membrane controls movement of substances.' },
    { id: 'mitochondrion', label: 'Mitochondrion', definition: 'the organelle where most ATP is produced', explanation: 'Mitochondria release energy during respiration.' },
    { id: 'chloroplast', label: 'Chloroplast', definition: 'the organelle containing chlorophyll for photosynthesis', explanation: 'Chloroplasts capture light energy for food production.' },
    { id: 'ribosome', label: 'Ribosome', definition: 'the site of protein synthesis', explanation: 'Ribosomes build proteins from amino acids.' },
  ],
  [
    { id: 'interphase', label: 'Interphase', definition: 'the stage when DNA replicates before division', explanation: 'Cells prepare for division during interphase.' },
    { id: 'mitosis', label: 'Mitosis', definition: 'division that preserves chromosome number', explanation: 'Mitosis produces identical daughter cells.' },
    { id: 'meiosis', label: 'Meiosis', definition: 'reduction division that forms haploid cells', explanation: 'Meiosis halves chromosome number.' },
    { id: 'crossing-over', label: 'Crossing Over', definition: 'exchange of genetic material between homologous chromosomes', explanation: 'Crossing over increases genetic variation.' },
    { id: 'cytokinesis', label: 'Cytokinesis', definition: 'physical separation of cytoplasm into daughter cells', explanation: 'Cytokinesis completes cell division.' },
  ],
  [
    { id: 'carbohydrate', label: 'Carbohydrate', definition: 'an organic compound commonly used for energy', explanation: 'Carbohydrates are important energy sources.' },
    { id: 'protein', label: 'Protein', definition: 'a polymer made from amino acids', explanation: 'Proteins are built from amino acids.' },
    { id: 'lipid', label: 'Lipid', definition: 'a hydrophobic molecule used in membranes and energy storage', explanation: 'Lipids store energy and form membrane components.' },
    { id: 'nucleic-acid', label: 'Nucleic Acid', definition: 'a molecule that stores genetic information', explanation: 'DNA and RNA are nucleic acids.' },
    { id: 'enzyme', label: 'Enzyme', definition: 'a biological catalyst that speeds reactions', explanation: 'Enzymes increase reaction rates without being consumed.' },
  ],
  [
    { id: 'bacteria', label: 'Bacteria', definition: 'single-celled prokaryotic microorganisms', explanation: 'Bacteria lack a true nucleus.' },
    { id: 'virus', label: 'Virus', definition: 'an acellular infectious particle that needs a host cell', explanation: 'Viruses reproduce only inside host cells.' },
    { id: 'cyanobacteria', label: 'Cyanobacteria', definition: 'photosynthetic prokaryotes often called blue-green algae', explanation: 'Cyanobacteria perform photosynthesis.' },
    { id: 'plasmid', label: 'Plasmid', definition: 'a small circular DNA molecule in many bacteria', explanation: 'Plasmids often carry extra bacterial genes.' },
    { id: 'binary-fission', label: 'Binary Fission', definition: 'simple asexual division common in bacteria', explanation: 'Bacteria commonly reproduce by binary fission.' },
  ],
  [
    { id: 'chlorophyceae', label: 'Chlorophyceae', definition: 'a green algal group rich in chlorophyll', explanation: 'Green algae contain chlorophyll a and b.' },
    { id: 'mycelium', label: 'Mycelium', definition: 'the mass of fungal hyphae', explanation: 'A network of hyphae forms mycelium.' },
    { id: 'hypha', label: 'Hypha', definition: 'a thread-like filament of a fungus', explanation: 'Hyphae make up the fungal body.' },
    { id: 'spore', label: 'Spore', definition: 'a reproductive unit used by many algae and fungi', explanation: 'Spores help dispersal and reproduction.' },
    { id: 'lichen', label: 'Lichen', definition: 'a symbiotic association of alga and fungus', explanation: 'Lichens combine fungal and algal partners.' },
  ],
  [
    { id: 'bryophyte', label: 'Bryophyte', definition: 'a non-vascular plant group such as mosses', explanation: 'Bryophytes lack true vascular tissue.' },
    { id: 'rhizoid', label: 'Rhizoid', definition: 'a root-like structure for anchorage in bryophytes', explanation: 'Rhizoids anchor the plant body.' },
    { id: 'sporophyte', label: 'Sporophyte', definition: 'the spore-producing diploid generation', explanation: 'The sporophyte produces spores.' },
    { id: 'prothallus', label: 'Prothallus', definition: 'the gametophyte stage of a fern', explanation: 'Fern gametophytes are called prothalli.' },
    { id: 'vascular-tissue', label: 'Vascular Tissue', definition: 'transport tissue present in pteridophytes but absent in bryophytes', explanation: 'Pteridophytes possess xylem and phloem.' },
  ],
  [
    { id: 'gymnosperm', label: 'Gymnosperm', definition: 'a seed plant with naked seeds', explanation: 'Gymnosperm seeds are not enclosed in fruits.' },
    { id: 'angiosperm', label: 'Angiosperm', definition: 'a flowering plant with seeds enclosed in fruits', explanation: 'Angiosperms produce flowers and fruits.' },
    { id: 'pollen', label: 'Pollen', definition: 'the structure carrying the male gametophyte', explanation: 'Pollen grains deliver male gametes.' },
    { id: 'ovule', label: 'Ovule', definition: 'the structure that develops into a seed after fertilization', explanation: 'Ovules become seeds after fertilization.' },
    { id: 'double-fertilization', label: 'Double Fertilization', definition: 'the angiosperm process forming zygote and endosperm', explanation: 'Double fertilization is characteristic of angiosperms.' },
  ],
  [
    { id: 'meristem', label: 'Meristem', definition: 'actively dividing plant tissue', explanation: 'Meristems drive plant growth.' },
    { id: 'xylem', label: 'Xylem', definition: 'vascular tissue that carries water and minerals', explanation: 'Xylem conducts water upward.' },
    { id: 'phloem', label: 'Phloem', definition: 'vascular tissue that transports organic food', explanation: 'Phloem distributes sugars.' },
    { id: 'epidermis', label: 'Epidermis', definition: 'the outer protective tissue layer', explanation: 'The epidermis protects plant organs.' },
    { id: 'cambium', label: 'Cambium', definition: 'a lateral meristem responsible for secondary growth', explanation: 'Cambium increases girth in stems and roots.' },
  ],
  [
    { id: 'transpiration', label: 'Transpiration', definition: 'loss of water vapor from aerial plant parts', explanation: 'Transpiration mainly occurs through stomata.' },
    { id: 'osmosis', label: 'Osmosis', definition: 'movement of water through a selectively permeable membrane', explanation: 'Water moves from dilute to concentrated solution in osmosis.' },
    { id: 'photosynthesis', label: 'Photosynthesis', definition: 'light-driven synthesis of carbohydrates from carbon dioxide and water', explanation: 'Photosynthesis makes food in green plants.' },
    { id: 'respiration', label: 'Respiration', definition: 'oxidation of food to release energy', explanation: 'Respiration releases cellular energy.' },
    { id: 'hormone', label: 'Plant Hormone', definition: 'a chemical regulator of plant growth and responses', explanation: 'Hormones coordinate plant growth.' },
  ],
  [
    { id: 'pollination', label: 'Pollination', definition: 'transfer of pollen from anther to stigma', explanation: 'Pollination precedes fertilization in flowering plants.' },
    { id: 'fertilization', label: 'Fertilization', definition: 'fusion of male and female gametes', explanation: 'Fertilization forms the zygote.' },
    { id: 'embryo-sac', label: 'Embryo Sac', definition: 'the female gametophyte of angiosperms', explanation: 'The embryo sac contains the egg cell.' },
    { id: 'seed', label: 'Seed', definition: 'a mature ovule containing an embryo', explanation: 'Seeds develop from ovules after fertilization.' },
    { id: 'fruit', label: 'Fruit', definition: 'a mature ovary formed after fertilization', explanation: 'Fruits develop from ovaries.' },
  ],
  [
    { id: 'tissue-culture', label: 'Tissue Culture', definition: 'growth of plant cells or tissues on nutrient medium', explanation: 'Tissue culture can rapidly multiply plants.' },
    { id: 'recombinant-dna', label: 'Recombinant DNA', definition: 'DNA formed by joining genetic material from different sources', explanation: 'Recombinant DNA combines genes in new ways.' },
    { id: 'vector', label: 'Vector', definition: 'a carrier used to transfer foreign DNA', explanation: 'Plasmids are common vectors.' },
    { id: 'pcr', label: 'PCR', definition: 'a technique used to amplify DNA', explanation: 'PCR produces many copies of a DNA segment.' },
    { id: 'clone', label: 'Clone', definition: 'a genetically identical copy', explanation: 'Clones share the same genetic makeup.' },
  ],
  [
    { id: 'ecosystem', label: 'Ecosystem', definition: 'a community interacting with its physical environment', explanation: 'Ecosystems include biotic and abiotic components.' },
    { id: 'producer', label: 'Producer', definition: 'an organism that makes its own food', explanation: 'Green plants are producers.' },
    { id: 'consumer', label: 'Consumer', definition: 'an organism that obtains food from other organisms', explanation: 'Consumers depend on producers or other consumers.' },
    { id: 'decomposer', label: 'Decomposer', definition: 'an organism that breaks down dead organic matter', explanation: 'Decomposers recycle nutrients.' },
    { id: 'food-chain', label: 'Food Chain', definition: 'a linear pathway of energy transfer through feeding', explanation: 'Food chains show who eats whom.' },
  ],
];

const zoologyConceptBanks: Concept[][] = [
  [
    { id: 'taxonomy', label: 'Taxonomy', definition: 'the science of naming and classifying organisms', explanation: 'Taxonomy organizes biodiversity.' },
    { id: 'species', label: 'Species', definition: 'a group of organisms able to interbreed and produce fertile offspring', explanation: 'Species is a basic unit of classification.' },
    { id: 'chordate', label: 'Chordate', definition: 'an animal with a notochord at some stage', explanation: 'Chordates possess a notochord during development.' },
    { id: 'binomial', label: 'Binomial Nomenclature', definition: 'the two-word scientific naming system', explanation: 'Genus and species form a scientific name.' },
    { id: 'vertebrate', label: 'Vertebrate', definition: 'an animal with a backbone', explanation: 'Vertebrates possess a vertebral column.' },
  ],
  [
    { id: 'hydra', label: 'Hydra', definition: 'a freshwater cnidarian with tentacles', explanation: 'Hydra is a simple freshwater cnidarian.' },
    { id: 'planaria', label: 'Planaria', definition: 'a flatworm known for regeneration', explanation: 'Planaria can regenerate lost body parts.' },
    { id: 'ascaris', label: 'Ascaris', definition: 'a parasitic roundworm', explanation: 'Ascaris is a nematode parasite.' },
    { id: 'cockroach', label: 'Cockroach', definition: 'an insect with jointed appendages and segmented body', explanation: 'Cockroach is a common arthropod example.' },
    { id: 'frog', label: 'Frog', definition: 'an amphibian that lives on land and in water', explanation: 'Frogs show amphibian characteristics.' },
  ],
  [
    { id: 'enzyme', label: 'Digestive Enzyme', definition: 'a catalyst that breaks food into simpler molecules', explanation: 'Digestive enzymes speed food hydrolysis.' },
    { id: 'stomach', label: 'Stomach', definition: 'the organ where protein digestion begins', explanation: 'Pepsin acts in the stomach.' },
    { id: 'bile', label: 'Bile', definition: 'a secretion that emulsifies fat', explanation: 'Bile breaks fat into tiny droplets.' },
    { id: 'villi', label: 'Villi', definition: 'finger-like projections that increase absorption area', explanation: 'Villi line the small intestine.' },
    { id: 'peristalsis', label: 'Peristalsis', definition: 'wave-like muscular movement of the gut', explanation: 'Peristalsis moves food along the alimentary canal.' },
  ],
  [
    { id: 'plasma', label: 'Plasma', definition: 'the liquid part of blood', explanation: 'Plasma transports dissolved substances.' },
    { id: 'erythrocyte', label: 'Erythrocyte', definition: 'a red blood cell specialized for oxygen transport', explanation: 'Erythrocytes contain hemoglobin.' },
    { id: 'hemoglobin', label: 'Hemoglobin', definition: 'the respiratory pigment that carries oxygen', explanation: 'Hemoglobin binds oxygen in red blood cells.' },
    { id: 'heart', label: 'Heart', definition: 'the muscular pump of the circulatory system', explanation: 'The heart drives blood flow.' },
    { id: 'artery', label: 'Artery', definition: 'a vessel carrying blood away from the heart', explanation: 'Arteries carry blood outward from the heart.' },
  ],
  [
    { id: 'alveolus', label: 'Alveolus', definition: 'a tiny air sac where gas exchange occurs', explanation: 'Alveoli provide a large surface for diffusion.' },
    { id: 'diaphragm', label: 'Diaphragm', definition: 'the muscle that helps ventilation', explanation: 'Diaphragm movement changes thoracic volume.' },
    { id: 'trachea', label: 'Trachea', definition: 'the windpipe that conducts air to the lungs', explanation: 'The trachea is kept open by cartilage rings.' },
    { id: 'gas-exchange', label: 'Gas Exchange', definition: 'diffusion of oxygen and carbon dioxide between air and blood', explanation: 'Gas exchange occurs across alveolar walls.' },
    { id: 'inhalation', label: 'Inhalation', definition: 'the process of drawing air into the lungs', explanation: 'Thoracic volume increases during inhalation.' },
  ],
  [
    { id: 'nephron', label: 'Nephron', definition: 'the functional unit of the kidney', explanation: 'Nephrons filter blood and form urine.' },
    { id: 'kidney', label: 'Kidney', definition: 'the organ that removes nitrogenous waste from blood', explanation: 'Kidneys regulate water and excretion.' },
    { id: 'urea', label: 'Urea', definition: 'the main nitrogenous waste in humans', explanation: 'Urea is formed from amino acid breakdown.' },
    { id: 'glomerulus', label: 'Glomerulus', definition: 'a capillary knot where ultrafiltration begins', explanation: 'Filtration starts in the glomerulus.' },
    { id: 'dialysis', label: 'Dialysis', definition: 'artificial removal of wastes when kidneys fail', explanation: 'Dialysis substitutes part of kidney function.' },
  ],
  [
    { id: 'bone', label: 'Bone', definition: 'a rigid connective tissue supporting the body', explanation: 'Bones provide support and protection.' },
    { id: 'muscle', label: 'Muscle', definition: 'contractile tissue that produces movement', explanation: 'Muscles shorten to move body parts.' },
    { id: 'tendon', label: 'Tendon', definition: 'a structure connecting muscle to bone', explanation: 'Tendons transmit muscular force.' },
    { id: 'synovial-joint', label: 'Synovial Joint', definition: 'a freely movable joint with a fluid-filled cavity', explanation: 'Synovial joints allow wide movement.' },
    { id: 'antagonistic', label: 'Antagonistic Muscle', definition: 'a muscle pair that works in opposite directions', explanation: 'Biceps and triceps act antagonistically.' },
  ],
  [
    { id: 'neuron', label: 'Neuron', definition: 'a cell specialized for nerve impulse transmission', explanation: 'Neurons carry signals through the nervous system.' },
    { id: 'synapse', label: 'Synapse', definition: 'the junction between two neurons', explanation: 'Signals pass across synapses chemically.' },
    { id: 'hormone', label: 'Hormone', definition: 'a chemical messenger released by endocrine glands', explanation: 'Hormones coordinate slower body responses.' },
    { id: 'reflex-arc', label: 'Reflex Arc', definition: 'the neural pathway of a rapid automatic response', explanation: 'Reflex arcs produce quick involuntary actions.' },
    { id: 'cerebrum', label: 'Cerebrum', definition: 'the brain region responsible for higher mental functions', explanation: 'The cerebrum handles memory and reasoning.' },
  ],
  [
    { id: 'gamete', label: 'Gamete', definition: 'a haploid reproductive cell', explanation: 'Sperm and ova are gametes.' },
    { id: 'fertilization', label: 'Fertilization', definition: 'fusion of male and female gametes', explanation: 'Fertilization forms a zygote.' },
    { id: 'embryo', label: 'Embryo', definition: 'the early developing stage after fertilization', explanation: 'The embryo develops from the zygote.' },
    { id: 'placenta', label: 'Placenta', definition: 'the organ exchanging materials between mother and fetus', explanation: 'The placenta supports fetal development.' },
    { id: 'puberty', label: 'Puberty', definition: 'the stage when reproductive maturity develops', explanation: 'Puberty brings reproductive capability.' },
  ],
  [
    { id: 'antibody', label: 'Antibody', definition: 'a protein that specifically binds an antigen', explanation: 'Antibodies help neutralize pathogens.' },
    { id: 'antigen', label: 'Antigen', definition: 'a substance that triggers an immune response', explanation: 'Antigens stimulate defense mechanisms.' },
    { id: 'lymphocyte', label: 'Lymphocyte', definition: 'a white blood cell important in immunity', explanation: 'Lymphocytes include B cells and T cells.' },
    { id: 'vaccine', label: 'Vaccine', definition: 'a preparation that trains immune memory', explanation: 'Vaccines help prevent disease.' },
    { id: 'phagocytosis', label: 'Phagocytosis', definition: 'engulfment of particles by immune cells', explanation: 'Phagocytes swallow pathogens.' },
  ],
  [
    { id: 'gene', label: 'Gene', definition: 'a DNA segment controlling a trait', explanation: 'Genes carry hereditary information.' },
    { id: 'allele', label: 'Allele', definition: 'an alternative form of a gene', explanation: 'Different alleles can produce trait variation.' },
    { id: 'dna', label: 'DNA', definition: 'the hereditary molecule storing genetic instructions', explanation: 'DNA contains genetic information.' },
    { id: 'mutation', label: 'Mutation', definition: 'a heritable change in genetic material', explanation: 'Mutations create new variation.' },
    { id: 'selection', label: 'Natural Selection', definition: 'differential survival of better-adapted organisms', explanation: 'Natural selection drives evolution.' },
  ],
  [
    { id: 'instinct', label: 'Instinct', definition: 'an inborn pattern of behavior', explanation: 'Instincts do not require prior learning.' },
    { id: 'taxis', label: 'Taxis', definition: 'directed movement toward or away from a stimulus', explanation: 'Taxis has a directional response.' },
    { id: 'kinesis', label: 'Kinesis', definition: 'non-directional change in movement rate due to a stimulus', explanation: 'Kinesis changes activity without direction.' },
    { id: 'imprinting', label: 'Imprinting', definition: 'rapid learning during a sensitive period', explanation: 'Imprinting occurs early in life.' },
    { id: 'communication', label: 'Communication', definition: 'transfer of information between animals', explanation: 'Signals help animals coordinate behavior.' },
  ],
];

function buildChapterSeeds(): ChapterSeed[] {
  return [
    ...sscExamChapters.map((chapter, index) => ({
      level: 'SSC' as const,
      subject: 'Biology' as const,
      chapterName: chapter.name,
      concepts: sscConceptBanks[index],
    })),
    ...hscBotanyExamChapters.map((chapter, index) => ({
      level: 'HSC' as const,
      subject: 'Udbid Biggan' as const,
      chapterName: chapter.name,
      concepts: botanyConceptBanks[index],
    })),
    ...hscZoologyExamChapters.map((chapter, index) => ({
      level: 'HSC' as const,
      subject: 'Prani Biggan' as const,
      chapterName: chapter.name,
      concepts: zoologyConceptBanks[index],
    })),
  ];
}

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length]);
}

function toAnswerOption(index: number): AnswerOption {
  return (['A', 'B', 'C', 'D'] as AnswerOption[])[index];
}

function createStarterQuestions(seed: ChapterSeed, chapterTitle: string) {
  return seed.concepts.flatMap((concept, conceptIndex) => (
    promptTemplates.map((makePrompt, variantIndex) => {
      const distractors = seed.concepts
        .filter((candidate) => candidate.id !== concept.id)
        .slice(0, 3)
        .map((candidate) => candidate.label);
      const options = rotate([concept.label, ...distractors], conceptIndex + variantIndex);
      const correctIndex = options.indexOf(concept.label);

      return {
        id: `starter__${seed.level}__${seed.subject}__${seed.chapterName}__${concept.id}__${variantIndex + 1}`,
        level: seed.level,
        subject: seed.subject,
        testType: 'chapter_wise' as const,
        chapterName: seed.chapterName,
        questionText: makePrompt(chapterTitle, concept.definition),
        optionA: options[0],
        optionB: options[1],
        optionC: options[2],
        optionD: options[3],
        correctOption: toAnswerOption(correctIndex),
        explanation: concept.explanation,
        difficulty: difficultyByVariant[variantIndex],
        status: 'active' as const,
        createdAt: 0,
        updatedAt: 0,
      };
    })
  ));
}

const chapterTitleByKey = new Map<string, string>([
  ...sscExamChapters.map((chapter) => [`SSC__Biology__${chapter.name}`, chapter.title] as const),
  ...hscBotanyExamChapters.map((chapter) => [`HSC__Udbid Biggan__${chapter.name}`, chapter.title] as const),
  ...hscZoologyExamChapters.map((chapter) => [`HSC__Prani Biggan__${chapter.name}`, chapter.title] as const),
]);

export const starterMcqQuestions = buildChapterSeeds().flatMap((seed) => (
  createStarterQuestions(
    seed,
    chapterTitleByKey.get(`${seed.level}__${seed.subject}__${seed.chapterName}`) ?? seed.chapterName,
  )
));

const starterQuestionMap = new Map(starterMcqQuestions.map((question) => [question.id, question]));

export function getStarterQuestionsForExam(config: ExamConfig) {
  return starterMcqQuestions.filter((question) => {
    const matchesLevel = question.level === config.level;
    const matchesSubject = question.subject === config.subject;
    const matchesChapter = config.testType === 'full_book'
      || question.chapterName === config.chapterName;

    return matchesLevel && matchesSubject && matchesChapter;
  });
}

export function getStarterQuestionsByIds(questionIds: string[]) {
  return questionIds
    .map((questionId) => starterQuestionMap.get(questionId))
    .filter((question): question is StarterMcqQuestion => Boolean(question));
}
