async function listServices(req, res) {
	// Dummy data for customer's services/orders
	const services = [
		{ id: 'svc_1', name: 'Starter Plan', status: 'active', createdAt: new Date(Date.now() - 86400000) },
		{ id: 'svc_2', name: 'Addon: Analytics', status: 'pending', createdAt: new Date(Date.now() - 3600000) }
	];
	return res.json({ services });
}

module.exports = { listServices };


