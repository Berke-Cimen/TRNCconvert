let active = 0;
const MAX = 3;

module.exports = async function withLimit(res, fn) {
  if (active >= MAX)
    return res.json({ success: false, error: "Sunucu meşgul, tekrar deneyin." });

  active++;
  try {
    await fn();
  } finally {
    active--;
  }
};
