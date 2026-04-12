let appPromise;

const getApp = async () => {
  if (!appPromise) {
    appPromise = import("../server/app.js").then((module) => module.default);
  }

  return appPromise;
};

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
