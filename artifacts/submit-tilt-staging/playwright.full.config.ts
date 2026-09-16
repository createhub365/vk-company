import {defineConfig} from '@playwright/test';
import base from '../../playwright.config';
export default defineConfig({...base,testDir:'../../tests/e2e',outputDir:'./full-results',
reporter:[['list'],['json',{outputFile:'full-results.json'}]],
use:{...base.use,baseURL:'http://127.0.0.1:3112',trace:'off',video:'off'},
webServer:{command:'node scripts/preview-static.mjs 3112',cwd:process.cwd(),url:'http://127.0.0.1:3112',reuseExistingServer:false}});
