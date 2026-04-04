/**
 * POS invoice GET returns a flat Invoice JSON (not wrapped in { data }).
 * Normalize for print/preview UI that expects date, customer_name, and line labels.
 */
export function normalizeInvoiceDetailFromApi(body) {
  const inv = body?.data ?? body;
  if (!inv || typeof inv !== 'object') {
    return null;
  }
  const items = (inv.items || []).map((it) => ({
    ...it,
    product_name_en:
      it.product_name_en ??
      it.product?.name_en ??
      it.product?.name_ar ??
      it.invoiceItem?.product?.name_en ??
      it.invoiceItem?.product?.name_ar ??
      it.product_name ??
      '—',
  }));
  return {
    ...inv,
    items,
    date: inv.date ?? inv.created_at ?? '',
    customer_name: inv.customer_name ?? inv.customer?.name ?? '',
  };
}
