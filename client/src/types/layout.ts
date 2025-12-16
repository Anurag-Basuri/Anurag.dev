export interface LayoutState {
	sidebar: {
		collapsed: boolean;
		size: number;
	};
	terminal: {
		collapsed: boolean;
		size: number;
	};
	main: {
		vertical: number[];
		horizontal: number[];
	};
}
