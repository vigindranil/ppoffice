module.exports = {
  apps : [{
    name   : "ppo-office-casetrack", 
    script : "server.js",           
    watch  : false,                
    env: {
      NODE_ENV: "development",
      PUPPETEER_SKIP_DOWNLOAD: "true",
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium-browser" 
    },
    env_production: {
      NODE_ENV: "production",
      PUPPETEER_SKIP_DOWNLOAD: "true",
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium-browser" 
    }
  }]
};