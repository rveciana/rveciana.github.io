---
layout: ../../layouts/Post.astro
title: "Lucide icons in Astro"
pubDate: 2025-01-05
teaser: astro-lucide.png
categories: other
tags: [astro, lucide]
thumbnail: /images/other/astro-lucide/twitter.png
description: "Fast tip to add Lucide icons in Astro js"
twitter-card: summary
---

I have been trying to add Lucide icons to an Astro project, since I am using Shadcn, and even I found a post, it's not working as I wanted. So here is a solution that accepts any icon and gives a TypeScript error if the icon doesn't exist.

Install lucide first:

`npm install lucide`

And create a _Lucide.astro_ component:

```astro
---
import Lucide from "lucide";
type Props = {
  icon: keyof typeof Lucide;
  height?: number;
  width?: number;
  fill?: string;
  stroke?: string;
};

const { icon, width, height, fill, stroke } = Astro.props;

const iconData = Lucide[icon];
const attributes = iconData[1];
const children = iconData[2];

const modifiedAttributes = {
  ...attributes,
  fill: fill ?? attributes.fill,
  stroke: stroke ?? attributes.stroke,
  width: width ?? attributes.width,
  height: height ?? attributes.height,
};

const componentChildren = children
  ?.map(
    ([child, attributes2]) =>
      `<${child} ${Object.entries(attributes2)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ")} />`
  )
  .join("\n");
---

<svg {...modifiedAttributes} set:html={componentChildren} />
```

You can then use it like this:

```astro
---
import LucideIcon from "./LucideIcon.astro";
---

<LucideIcon icon="Star" fill="orange" stroke="none" />
```

### Links

- [Add Lucide Icons to Astro post](https://dev.to/chantastic/add-lucide-icons-to-astro-42el)
