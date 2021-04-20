import { configuration } from '$lib/config';
import Handlebars from 'handlebars';
import Prism from 'prismjs';

export const md2html = (mdContent: string): string => {
	const template = Handlebars.compile(mdContent);

	const text = template(configuration);

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
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/{% highlight [a-z]* %}/g, '')
			.replace(/{% endhighlight %}/g, '');
		switch (lang) {
			case 'js':
				return `<pre><code>${Prism.highlight(code, Prism.languages.javascript)}</code></pre>`;
			case 'json':
				return `<pre><code>${Prism.highlight(code, Prism.languages.javascript)}</code></pre>`;
			case 'html':
				return `<pre><code>${Prism.highlight(code, Prism.languages.html)}</code></pre>`;
		}
		return code;
	});

	return codeMatches?.reduce((acc, curr, i) => acc.replace(curr, formattedCode[i]), text) ?? text;
};
