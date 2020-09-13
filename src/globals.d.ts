/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="jest-enzyme" />

declare module '*.svg' {
	const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement> & { title?: string }
	>;

	export default ReactComponent;
}

declare module '*.styles.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*' {
	const src: string;
	export default src;
}
