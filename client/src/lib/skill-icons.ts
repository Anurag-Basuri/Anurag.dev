import { type ComponentType } from 'react';
import {
	Code2,
	Database,
	Cloud,
	Terminal,
	BrainCircuit,
	Cpu,
	Globe,
	Layers,
	Shield,
	Smartphone,
	MonitorPlay,
	Binary,
	Container,
	Network,
	Combine,
	Bot,
	Sparkles,
	Waypoints,
	Settings2,
	Boxes,
	Component,
	Server,
	Blocks,
	Eye,
	MessageSquare,
	Workflow,
} from 'lucide-react';
import {
	SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiHtml5, SiCss, SiTailwindcss, SiVuedotjs, SiAngular, SiSvelte,
	SiNodedotjs, SiPython, SiCplusplus, SiC, SiSharp, SiRust, SiGo, SiPhp, SiRuby, SiSwift, SiKotlin,
	SiPostgresql, SiMysql, SiMongodb, SiRedis, SiSqlite, SiFirebase, SiSupabase, SiPrisma,
	SiDocker, SiKubernetes, SiGooglecloud, SiVercel, SiNetlify, SiHeroku, SiCloudflare,
	SiGit, SiGithub, SiGitlab, SiBitbucket, SiLinux, SiUbuntu, SiApple,
	SiTensorflow, SiPytorch, SiKeras, SiPandas, SiNumpy, SiJupyter,
	SiFigma, SiFramer,
	SiGraphql, SiApollographql, SiTrpc, SiRedux, SiReactquery,
	SiOpenai, SiHuggingface,
} from 'react-icons/si';
import { 
	FaJava, FaAws, FaWindows, FaMicrosoft, FaBrain
} from 'react-icons/fa6'; // Using FontAwesome 6 for missing standard brand icons

// ─── Interfaces ──────────────────────────────────────────────────

export interface SkillIconData {
	icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
	color: string;
}

// ─── Normalizer ──────────────────────────────────────────────────

/**
 * Normalizes a skill name for fuzzy matching by removing spaces, dots, dashes,
 * and converting to lowercase.
 * e.g., "React.js" -> "reactjs", "C++" -> "cpp", "Next JS" -> "nextjs"
 */
function normalizeSkill(skill: string): string {
	let normalized = skill.toLowerCase().replace(/[^a-z0-9+#]/g, '');
	
	// Special character replacements
	normalized = normalized.replace(/\+/g, 'p').replace(/#/g, 'sharp');
	return normalized;
}

// ─── Dictionary ──────────────────────────────────────────────────

/**
 * Massive lookup table linking normalized skill names (and exact aliases)
 * to their brand icons and exact hex colors.
 */
const EXACT_MATCH_DICT: Record<string, SkillIconData> = {
	// Frontend
	'react': { icon: SiReact, color: '#61DAFB' },
	'reactjs': { icon: SiReact, color: '#61DAFB' },
	'next': { icon: SiNextdotjs, color: '#FFFFFF' },
	'nextjs': { icon: SiNextdotjs, color: '#FFFFFF' },
	'vue': { icon: SiVuedotjs, color: '#4FC08D' },
	'vuejs': { icon: SiVuedotjs, color: '#4FC08D' },
	'angular': { icon: SiAngular, color: '#DD0031' },
	'svelte': { icon: SiSvelte, color: '#FF3E00' },
	'html': { icon: SiHtml5, color: '#E34F26' },
	'html5': { icon: SiHtml5, color: '#E34F26' },
	'css': { icon: SiCss, color: '#1572B6' },
	'css3': { icon: SiCss, color: '#1572B6' },
	'tailwind': { icon: SiTailwindcss, color: '#06B6D4' },
	'tailwindcss': { icon: SiTailwindcss, color: '#06B6D4' },

	// Languages
	'javascript': { icon: SiJavascript, color: '#F7DF1E' },
	'js': { icon: SiJavascript, color: '#F7DF1E' },
	'typescript': { icon: SiTypescript, color: '#3178C6' },
	'ts': { icon: SiTypescript, color: '#3178C6' },
	'python': { icon: SiPython, color: '#3776AB' },
	'py': { icon: SiPython, color: '#3776AB' },
	'c': { icon: SiC, color: '#A8B9CC' },
	'cpp': { icon: SiCplusplus, color: '#00599C' },
	'cplusplus': { icon: SiCplusplus, color: '#00599C' },
	'csharp': { icon: SiSharp, color: '#239120' },
	'java': { icon: FaJava, color: '#007396' },
	'rust': { icon: SiRust, color: '#000000' },
	'go': { icon: SiGo, color: '#00ADD8' },
	'golang': { icon: SiGo, color: '#00ADD8' },
	'php': { icon: SiPhp, color: '#777BB4' },
	'ruby': { icon: SiRuby, color: '#CC342D' },
	'swift': { icon: SiSwift, color: '#F05138' },
	'kotlin': { icon: SiKotlin, color: '#7F52FF' },

	// Backend & DB
	'node': { icon: SiNodedotjs, color: '#339939' },
	'nodejs': { icon: SiNodedotjs, color: '#339939' },
	'postgres': { icon: SiPostgresql, color: '#4169E1' },
	'postgresql': { icon: SiPostgresql, color: '#4169E1' },
	'mysql': { icon: SiMysql, color: '#4479A1' },
	'mongo': { icon: SiMongodb, color: '#47A248' },
	'mongodb': { icon: SiMongodb, color: '#47A248' },
	'redis': { icon: SiRedis, color: '#DC382D' },
	'sqlite': { icon: SiSqlite, color: '#003B57' },
	'firebase': { icon: SiFirebase, color: '#FFCA28' },
	'supabase': { icon: SiSupabase, color: '#3ECF8E' },
	'prisma': { icon: SiPrisma, color: '#2D3748' },
	'graphql': { icon: SiGraphql, color: '#E10098' },
	'apollo': { icon: SiApollographql, color: '#311C87' },
	'trpc': { icon: SiTrpc, color: '#2596BE' },

	// DevOps / Cloud / Tools
	'docker': { icon: SiDocker, color: '#2496ED' },
	'k8s': { icon: SiKubernetes, color: '#326CE5' },
	'kubernetes': { icon: SiKubernetes, color: '#326CE5' },
	'aws': { icon: FaAws, color: '#FF9900' },
	'amazon': { icon: FaAws, color: '#FF9900' },
	'gcp': { icon: SiGooglecloud, color: '#4285F4' },
	'googlecloud': { icon: SiGooglecloud, color: '#4285F4' },
	'azure': { icon: FaMicrosoft, color: '#0078D4' },
	'microsoftazure': { icon: FaMicrosoft, color: '#0078D4' },
	'vercel': { icon: SiVercel, color: '#000000' },
	'netlify': { icon: SiNetlify, color: '#00C7B7' },
	'heroku': { icon: SiHeroku, color: '#430098' },
	'cloudflare': { icon: SiCloudflare, color: '#F38020' },
	'git': { icon: SiGit, color: '#F05032' },
	'github': { icon: SiGithub, color: '#181717' },
	'gitlab': { icon: SiGitlab, color: '#FC6D26' },
	'linux': { icon: SiLinux, color: '#FCC624' },
	'ubuntu': { icon: SiUbuntu, color: '#E95420' },
	'windows': { icon: FaWindows, color: '#0078D6' },

	// Base ML / Data Science
	'tensorflow': { icon: SiTensorflow, color: '#FF6F00' },
	'tf': { icon: SiTensorflow, color: '#FF6F00' },
	'pytorch': { icon: SiPytorch, color: '#EE4C2C' },
	'keras': { icon: SiKeras, color: '#D00000' },
	'pandas': { icon: SiPandas, color: '#150458' },
	'numpy': { icon: SiNumpy, color: '#013243' },
	'jupyter': { icon: SiJupyter, color: '#F37626' },
	'openai': { icon: SiOpenai, color: '#412991' },
	'huggingface': { icon: SiHuggingface, color: '#FFD21E' },

	// LLM / GenAI / Architecture (Lucide Mapped)
	'langchain': { icon: Combine, color: '#12B981' }, // Chain/Link concept
	'rag': { icon: Boxes, color: '#8B5CF6' }, // Retrieval-Augmented Generation (Retrieving blocks of info)
	'vectordb': { icon: Database, color: '#3B82F6' },
	'pinecone': { icon: Database, color: '#000000' },
	'chroma': { icon: Database, color: '#FCAC15' },
	'milvus': { icon: Database, color: '#0EA5E9' },
	'qdrant': { icon: Database, color: '#E90856' },
	'weaviate': { icon: Database, color: '#10B981' },
	'mcp': { icon: Network, color: '#EC4899' }, // Machine Control Protocol / Model Context Protocol
	'mlops': { icon: Settings2, color: '#F59E0B' }, // Ops/Settings/Pipelines
	'llm': { icon: BrainCircuit, color: '#8B5CF6' },
	'agent': { icon: Bot, color: '#6366F1' },
	'ai': { icon: Sparkles, color: '#A855F7' },
	'cv': { icon: Eye, color: '#F43F5E' },
	'computervision': { icon: Eye, color: '#F43F5E' },
	'nlp': { icon: MessageSquare, color: '#10B981' },
	'naturallanguageprocessing': { icon: MessageSquare, color: '#10B981' },
	'aiorchestration': { icon: Workflow, color: '#6366F1' },
	'orchestration': { icon: Workflow, color: '#6366F1' },
	'neuralnetwork': { icon: Waypoints, color: '#EF4444' },
	'deeplearning': { icon: Layers, color: '#3B82F6' },
	'microservices': { icon: Component, color: '#14B8A6' },
	'serverless': { icon: Cloud, color: '#0EA5E9' },
};

// ─── Smart Category Fallbacks ────────────────────────────────────

/**
 * If we can't find an exact brand logo, we use keyword matching
 * to assign a generic, context-aware Lucide icon.
 */
function getCategoryFallback(skillStr: string, normalized: string): SkillIconData | null {
	const text = skillStr.toLowerCase();

	if (text.includes('vision')) {
		return { icon: Eye, color: '#F43F5E' };
	}
	if (text.includes('nlp') || text.includes('natural language')) {
		return { icon: MessageSquare, color: '#10B981' };
	}
	if (text.includes('orchestration') || text.includes('workflow')) {
		return { icon: Workflow, color: '#6366F1' };
	}

	// AI & Machine Learning & LLMs
	if (
		text.includes('ai') || text.includes('ml') || text.includes('llm') ||
		text.includes('neural') || text.includes('model') || text.includes('langchain') ||
		text.includes('rag') || text.includes('agent') || text.includes('mcp') ||
		text.includes('gpt') ||
		text.includes('deep learning') || text.includes('machine learning') ||
		text.includes('generative')
	) {
		return { icon: BrainCircuit, color: '#8B5CF6' }; // Purple
	}

	// Vector DBs / Data Engineering
	if (
		text.includes('db') || text.includes('data') || text.includes('sql') ||
		text.includes('vector') || text.includes('pinecone') || text.includes('chroma') || 
		text.includes('milvus') || text.includes('qdrant') || text.includes('weaviate')
	) {
		return { icon: Database, color: '#3B82F6' }; // Blue
	}

	// Architecture & Integration
	if (
		text.includes('architecture') || text.includes('microservice') || 
		text.includes('system') || text.includes('api') || text.includes('integration') ||
		text.includes('pipeline') || text.includes('workflow')
	) {
		return { icon: Blocks, color: '#14B8A6' }; // Teal
	}

	// Cloud / DevOps
	if (
		text.includes('cloud') || text.includes('ops') || text.includes('ci/cd') ||
		text.includes('deploy') || text.includes('serverless') || text.includes('kafka') || 
		text.includes('rabbitmq') || text.includes('infrastructure')
	) {
		return { icon: Cloud, color: '#0EA5E9' }; // Sky Blue
	}

	// App & Web
	if (text.includes('web') || text.includes('frontend') || text.includes('browser')) {
		return { icon: Globe, color: '#10B981' }; // Emerald
	}
	if (text.includes('app') || text.includes('mobile') || text.includes('ios') || text.includes('android')) {
		return { icon: Smartphone, color: '#F43F5E' }; // Rose
	}
	if (text.includes('backend') || text.includes('server')) {
		return { icon: Server, color: '#F59E0B' }; // Amber
	}

	// System / Low-level
	if (text.includes('os') || text.includes('linux') || text.includes('hardware') || text.includes('embedded')) {
		return { icon: Cpu, color: '#64748B' }; // Slate
	}

	// Cybersec
	if (text.includes('security') || text.includes('auth') || text.includes('crypto')) {
		return { icon: Shield, color: '#EF4444' }; // Red
	}

	return null;
}

// ─── Default Hashing Fallback ────────────────────────────────────

const DEFAULT_COLORS = [
	'#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
	'#8B5CF6', '#EC4899', '#06B6D4', '#EAB308',
	'#F97316', '#14B8A6'
];

/** Hash string to pick a consistent pseudo-random color */
function getStringColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

// ─── Main Export ──────────────────────────────────────────────────

/**
 * Robustly maps any custom skill name to the best possible Icon and Color.
 * 
 * Flow:
 * 1. Normalize string (strip spaces/symbols)
 * 2. Check exact matches + aliases (`reactjs` -> SiReact)
 * 3. Fall back to smart keyword categories (e.g. `langchain` -> BrainCircuit)
 * 4. Fall back to generic Code2 icon with consistent hashed color
 * 
 * @param skillName The raw string typed by the user (e.g., "Next.js", "MLOps (AWS)")
 * @returns Best-effort ComponentType and Hex Color pair
 */
export function getSkillIcon(skillName: string): SkillIconData {
	if (!skillName) {
		return { icon: Code2, color: '#888888' };
	}

	const normalized = normalizeSkill(skillName);

	// 1. Exact or Alias hit
	if (EXACT_MATCH_DICT[normalized]) {
		return EXACT_MATCH_DICT[normalized];
	}

	// 2. Keyword/Category Smart Fallback
	const categoryMatch = getCategoryFallback(skillName, normalized);
	if (categoryMatch) {
		return categoryMatch;
	}

	// 3. Last resort generic fallback
	return {
		icon: Code2,
		color: getStringColor(normalized),
	};
}
