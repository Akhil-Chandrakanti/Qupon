// Converts MySQL rows (snake_case) into the camelCase JSON shape
// the existing React frontend already expects, so no client changes are needed.

function serializeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    isAdmin: !!u.is_admin,
    level: u.level,
    points: u.points,
    createdAt: u.created_at,
  };
}

function serializeCoupon(c) {
  if (!c) return null;
  return {
    id: c.id,
    title: c.title,
    brand: c.brand,
    category: c.category,
    description: c.description,
    code: c.code,
    originalValue: Number(c.original_value),
    sellingPrice: Number(c.selling_price),
    expiryDate: c.expiry_date,
    status: c.status,
    sellerId: c.seller_id,
    buyerId: c.buyer_id,
    image: c.image,
    createdAt: c.created_at,
    verifiedAt: c.verified_at,
    ...(c.sellerName !== undefined ? { sellerName: c.sellerName } : {}),
    ...(c.sellerEmail !== undefined ? { sellerEmail: c.sellerEmail } : {}),
  };
}

function serializeTransaction(t) {
  if (!t) return null;
  return {
    id: t.id,
    couponId: t.coupon_id,
    buyerId: t.buyer_id,
    sellerId: t.seller_id,
    amount: Number(t.amount),
    upiId: t.upi_id,
    status: t.status,
    createdAt: t.created_at,
  };
}

module.exports = { serializeUser, serializeCoupon, serializeTransaction };
