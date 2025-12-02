import { useAtom } from 'jotai';
import { activeTabIdAtom, tabsAtom } from '@/store/atoms';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CLI } from './CLI';
import { getModuleComponent } from '@/lib/moduleRegistry';

export function TabManager() {
	const [tabs, setTabs] = useAtom(tabsAtom);
	const [activeTabId, setActiveTabId] = useAtom(activeTabIdAtom);

	const activeTab = tabs.find(tab => tab.id === activeTabId);

	const handleCloseTab = (e: React.MouseEvent<HTMLButtonElement>, tabId: string) => {
		e.stopPropagation(); // Prevent activating the tab
		const tabIndex = tabs.findIndex(tab => tab.id === tabId);
		if (tabIndex === -1) return;

		const newTabs = tabs.filter(tab => tab.id !== tabId);
		setTabs(newTabs);

		// If the closed tab was active, switch to a different tab
		if (activeTabId === tabId) {
			if (newTabs.length > 0) {
				// Switch to the previous tab or the first one
				const newActiveIndex = Math.max(0, tabIndex - 1);
				setActiveTabId(newTabs[newActiveIndex].id);
			} else {
				// This case should ideally not happen if we prevent closing the last tab
				setActiveTabId('');
			}
		}
	};

	return (
		<div className="flex flex-col h-full bg-[#1e1e1e]">
			<div className="flex items-center bg-[#252526] border-b border-black">
				{tabs.map(tab => (
					<div
						key={tab.id}
						onClick={() => setActiveTabId(tab.id)}
						className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-black ${
							activeTabId === tab.id
								? 'bg-[#1e1e1e] text-white'
								: 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e3e]'
						}`}
					>
						<span>{tab.title}</span>
						{/* Prevent closing the CLI tab */}
						{tab.type !== 'cli' && (
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5 rounded-full hover:bg-gray-600"
								onClick={e => handleCloseTab(e, tab.id)}
							>
								<X size={14} />
							</Button>
						)}
					</div>
				))}
			</div>
			<div className="flex-grow overflow-auto">
				{activeTab?.type === 'cli' && <CLI />}
				{activeTab?.type === 'module' && getModuleComponent(activeTab.id)}
			</div>
		</div>
	);
}
