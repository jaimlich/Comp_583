const { getClosures } = require("../utils/roadClosureCache");

exports.getRoadClosures = async (req, res) => {
  try {
    let retries = 0;
    let closures = getClosures();

    while ((!closures || closures.length === 0) && retries < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // wait 1.5s
      closures = getClosures();
      retries++;
    }

    if (!closures || closures.length === 0) {
      return res.status(204).json([]);
    }

    res.json(closures);
  } catch (err) {
    console.error("❌ Failed to serve cached road closures:", err.message);
    res.status(500).json({ error: "Could not return road closures" });
  }
};
