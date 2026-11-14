import { getUserAnalytics } from '../services/dbService.js';

export async function getAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const analytics = await getUserAnalytics(userId);

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics data.',
    });
  }
}
