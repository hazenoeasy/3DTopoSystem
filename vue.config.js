module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        const result = args.slice();
        result[0].title = '3DTopoSystem';
        return result;
      });
  },
};
