import { configuration } from '$lib/config';
import Handlebars from 'handlebars';
import Prism from 'prismjs';

export const md2html = (mdContent: string): string => {
	const template = Handlebars.compile(mdContent);

	const text = template(configuration)
		.replace(/<pre><code>/g, '')
		.replace(/<\/code><\/pre>/g, '');

	const codeMatches = text.match(/{% highlight [a-z]* %}(.|\n)*?{% endhighlight %}/g);

	const formattedCode = codeMatches?.map((d) => {
		const lang = d
			.match(/{% highlight [a-z]* %}/g)[0]
			.replace(/{% highlight /g, '')
			.replace(/ %}/g, '');
		const code = d
			.replace(/<p>/g, '\n')
			.replace(/<\/p>/g, '')
			.replace(/&quot;/gi, `"`)
			.replace(/&#39;/gi, `'`)
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/{% highlight [a-z]* %}/g, '')
			.replace(/{% endhighlight %}/g, '');

		switch (lang) {
			case 'js':
				return `${Prism.highlight(code, Prism.languages.javascript)}`;
			case 'json':
				return `${Prism.highlight(code, Prism.languages.javascript)}`;
			case 'html':
				return `${Prism.highlight(code, Prism.languages.html)}`;
			case 'python':
				return `${Prism.highlight(code, Prism.languages.js)}`;
			default:
				return `${Prism.highlight(code, Prism.languages.js)}`;
		}
	});

	return (
		codeMatches?.reduce((acc, curr, i) => {
			return acc.replace(curr, `<pre><code>${formattedCode[i]}</code></pre>`);
		}, text) ?? text
	);
};
