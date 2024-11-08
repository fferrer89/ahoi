import fs from "node:fs/promises";
import Signup from "../views/pages/signup.mjs";
import Layout from "../views/layout.mjs";
import Login from "../views/pages/login.mjs";
import Notfound from "../views/pages/notfound.mjs";
import Home from "../views/pages/home.mjs";
import path from "node:path";

/**
 * File Stats:
 * - .mtime → The timestamp (UTC) indicating the last time this file was modified. E.g.: homeFileStats.mtime
 * - .size → TThe size of the file in bytes. 1024000 bits = 1MB. E.g.: homeFileStats.size
 * - .birthtime → TThe timestamp indicating the creation time of this file. E.g.: homeFileStats.birthtime
 */
export default class StaticPagesBuilder {
    static homeFileStats;
    static signupFileStats;
    static loginFileStats;
    static notFoundFileStats;
    static {
        // Fire & Forget functions
        StaticPagesBuilder.home().catch(r => console.error(r));
        StaticPagesBuilder.signup().catch(r => console.error(r));
        StaticPagesBuilder.login().catch(r => console.error(r));
        StaticPagesBuilder.notFound().catch(r => console.error(r));
    }
    static async home() {
        const home = Home();
        const layout = Layout({
                page: { title: 'Home'},
            }, [home]
        );
        await fs.writeFile('src/static/index.html', layout, { encoding: 'utf8' });
        const homePagePath = path.resolve('src/static/index.html');
        StaticPagesBuilder.homeFileStats = await fs.stat(homePagePath);
    }
    static async signup() {
        const signup = Signup();
        const layout = Layout({
                page: {title: 'Signup'},
            }, [signup]
        );
        await fs.writeFile('src/static/signup.html', layout, { encoding: 'utf8' });
        const signupPagePath = path.resolve('src/static/signup.html'); // static/signup.html
        StaticPagesBuilder.signupFileStats = await fs.stat(signupPagePath);
    }
    static async login() {
        const login = Login();
        const layout = Layout({
                page: { title: 'Login'},
            }, [login]
        );
        await fs.writeFile('src/static/login.html', layout, { encoding: 'utf8' });
        const loginPagePath = path.resolve('src/static/login.html');
        StaticPagesBuilder.loginFileStats = await fs.stat(loginPagePath);
    }
    static async notFound() {
        const notFound = Notfound();
        const layout = Layout({page: {title: 'Not Found'}}, [notFound]);
        await fs.writeFile('src/static/notfound.html', layout, { encoding: 'utf8' });
        const notFoundPagePath = path.resolve('src/static/notfound.html');
        StaticPagesBuilder.notFoundFileStats = await fs.stat(notFoundPagePath);
    }
}