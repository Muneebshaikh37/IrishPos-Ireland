import authAPI from '@/network/modules/auth.js';
import Category from '../modules/category';
import Product from '../modules/product'
import Services from '../modules/services'
import Brand from '../modules/brand'
import Brands from '../modules/brands'
import SubCategories from '../modules/subCategories'
import Packings from '../modules/packing'
import Pos from '../modules/pos';
import Register from '../modules/register';
import Supplier from '../modules/supplier'
import PurchaseInvoice from '../modules/purchaseInvoice'
import StockCount from '../modules/stockCount'
import Attribute from '../modules/attribute'

const apiService = {
    auth: authAPI,
    category: Category,
    product: Product,
    services: Services,
    brands: Brands,
    subCategories: SubCategories,
    packings: Packings,
    pos:Pos,
    register:Register,
    brand:Brand,
    supplier: Supplier,
    purchaseInvoice: PurchaseInvoice,
    stockCount: StockCount,
    attribute: Attribute
};

export default apiService;
