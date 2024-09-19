import html from "../utils/html.mjs";
const ENV = process.env.ENV ? process.env.ENV : 'development';

/**
 *
 * Example:
 *  const layout = Layout({page: { title: 'Home', description: 'My Description'}});
 *  await fs.writeFile('build/index.html', layout, {encoding: 'utf8'});
 *  const homePage = await fs.readFile(homePagePath, { encoding: 'utf8' });
 *  res.writeHead(200);
 *  res.end(homePage);
 *
 * @param props
 * @param children
 * @return string
 * @constructor
 */
export default function Layout(props, children) {
    const { page: {title, description} } = props;
    return (
        html`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1">
                <title>Ahoi${title && ` - ${title}`}</title>
                <meta name="description" content="${description ? description : 'Boat renting and leasing website'}">
                <meta name="keywords" content="ahoi, rent, boat, sea adventure, water activity">
                <meta name="robots" content="${(ENV === "development") ? 'NOINDEX, NOFOLLOW' : 'INDEX, FOLLOW'}">
                <meta name="author" content="Kiko Ferrer">
                <link rel="stylesheet" href="/public/styles/index.css">
            </head>
            <body>
            <header>
                <h1>Ahoi</h1>
                <nav>
                    <ul>
                        <li>
                            <a href="/" ${(title === 'Home') && 'aria-current="page"'}>Home</a>
                        </li>
                        <li>
                            <a href="/" ${(title === 'About') && 'aria-current="page"'}>About</a>
                        </li>
                        <li>
                            <a href="/" ${(title === 'Contact') && 'aria-current="page"'}>Contact</a>
                        </li>
                    </ul>
                </nav>
            </header>
            ${children}
            <footer>

            </footer>
            </body>
            </html>
        `
    )
}