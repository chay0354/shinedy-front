import JewelArt from './JewelArt.jsx'
import CutoutImage from './CutoutImage.jsx'

// תמונת מוצר: צילום אמיתי אם הועלה במערכת הניהול, אחרת איור הקטגוריה
export default function Art({ product }) {
  if (product.image) {
    return <CutoutImage src={product.image} alt={product.name} className="product-photo" />
  }
  return <JewelArt category={product.category} />
}
