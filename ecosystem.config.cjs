module.exports = {
  apps: [
    {
      name: "Isuzu Awards Gallery",
      script: "/home/isuzuawards-gallery/.nvm/versions/node/v22.22.2/bin/serve",
      args: "-s dist -l 3720",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};