# Full-Stack Developer Portfolio - Ahmed Radwan

## Creative direction

**The Human Signal** puts Ahmed’s name and portrait at the center of an editorial composition. A canvas routing diagram frames the photograph and lets visitors trace three layers of his work: interfaces, APIs, and AI integrations. The same linework carries into the project diagrams, connecting the opening interaction to concrete engineering decisions and their source code.

Condensed headlines and a fine rule grid set the rhythm. Each existing palette supplies the page accent and diagram ink in both light and dark mode. The portrait and selected route are visible independently of motion. Native scrolling carries the visitor from the introduction through projects, skills, experience, and contact.

A static portfolio for Ahmed Haitham Radwan, a full-stack developer and teaching assistant at the Islamic University of Gaza.

##  Live Demo
- Cloudflare Pages: [ahmed-radwan.pages.dev](https://ahmed-radwan.pages.dev/)
- GitHub Pages (kept online): [a7med-radwan.github.io/ahmed-radwan-portfolio](https://a7med-radwan.github.io/ahmed-radwan-portfolio/)

##  Deployment
The site is a static project with no build step. Cloudflare Pages deploys the repository root from the `main` branch with the build command `exit 0` and the output directory `/`. Pushes to `main` automatically publish a new production deployment.

##  Key Features
- **Full-Stack & AI Focused**: Showcasing expertise in Laravel 13, React, RESTful APIs, Node.js, and AI integrations (OpenAI/Claude).
- **Current background**: Teaching Assistant at the Islamic University of Gaza, followed by development experience, education, and eleven certifications and courses.
- **Visual identity**: A typographic masthead, a real portrait, and architecture diagrams that adapt to every palette.
- **Responsive layouts**: A wide editorial plate on desktop and a stacked portrait with touch targets on mobile.
- **Interactive Elements**:
  - The signal diagram connects Interfaces to Write AI, APIs to Pharmacy API, and AI integrations to Gradly API. Each route opens a directly linkable case study. The controls also support arrow keys, Home, and End.
  - Nine projects selected through an index, previous/next controls, or arrow keys, Home, and End.
  - Each case study has a short animated schematic that plays when it comes into view. Use Replay animation to watch it again, or Next step to explore still frames with motion turned off.
  - A masked masthead entrance, scroll-position indicator, section transitions, and subtle pointer response.
  - Keyboard-accessible experience, education, and certification tabs.
  - Expandable skill categories and work history, mobile navigation, and native focus indicators.
- **Dynamic Themes**: Black & white, Amethyst, Electric Blue, Cyber Teal, Matrix Green, Deep Indigo, and Solar Gold, each with dark/light mode. Existing saved theme preferences remain valid; new visits start in black & white.
- **Motion preferences**: The motion switch and system reduced-motion setting keep the selected route visible as a static drawing. Canvas animation runs on demand with a fine pointer and pauses when the diagram leaves the viewport or the tab is hidden.
- **Performance Optimized**: Lightweight assets and clean semantic HTML for SEO.

##  Built With
- **HTML5**: Semantic structure.
- **CSS3**: Custom styling with CSS variables and modern layout techniques.
- **JavaScript (ES6+)**: Custom animations and interactive logic.
- **Self-hosted fonts**: Barlow Condensed for headings and Manrope for body copy, with SIL Open Font License files in `fonts/`. No external font requests.
- **No build step or JavaScript framework**: Open `index.html` or serve the directory with any static server.
- **Accessibility**: Reduced-motion support, semantic landmarks, labeled fields, and keyboard navigation.

##  Project Structure
- `index.html`: Main application entry point.
- `style.css`: Themes, editorial layout, hero, and section styling.
- `work.css`: Project navigation and responsive architecture diagrams.
- `project-films.js`: Canvas illustrations for the nine case studies.
- `script.js`: Signal drawing, project selection, navigation, tabs, motion, scroll position, and theme preferences.
- `images/profile.png` and `images/profile-900.jpg`: The existing source photograph and a smaller copy used by the hero.
- `fonts/`: Local WOFF2 files, font declarations, and licenses.
- `documents/Ahmed_Radwan_CV.pdf`: The current résumé, opened by the portfolio's résumé link.

##  Contact
Feel free to reach out via the contact form on the website or directly at:
- **Email**: [ahmed4.radwan7@gmail.com](mailto:ahmed4.radwan7@gmail.com)
- **LinkedIn**: [Ahmed Radwan](https://www.linkedin.com/in/ahmed-radwan-64b733343/)

---
*Created with  by Ahmed Radwan - 2026*
