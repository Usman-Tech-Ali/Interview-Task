const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.startsWith('Bearer ')
			? authHeader.substring(7)
			: null;
		if (!token) return res.status(401).json({ message: 'Missing auth token' });

		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: payload.id, role: payload.role };
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
}

function authorize(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		return next();
	};
}

function signJwt(payload, expiresIn = '7d') {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

module.exports = { authenticate, authorize, signJwt };

