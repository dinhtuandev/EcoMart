import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../services/productApi';
import { categoryApi } from '../../services/categoryApi';
import { usePublicCertifications } from '../../hooks/usePublicCertifications';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { StarRating } from '../../components/ui/StarRating';
import { NewsletterSection } from '../../components/ui/NewsletterSection';
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Recycle,
  Award,
  CheckCircle2,
  TreePine,
  Heart,
  Package,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { Product, Category } from '../../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  const { certifications, isLoading: loadingCerts } = usePublicCertifications();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productApi.getProducts({ page: 0, pageSize: 8, sort: 'newest' }, controller.signal),
          categoryApi.getCategories(controller.signal),
        ]);

        if (isMounted) {
          const items: Product[] = Array.isArray(prodRes.data)
            ? (prodRes.data as Product[])
            : prodRes.data?.items || prodRes.data?.content || [];
          setProducts(items);
          setCategories(catRes.data || []);
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error('Failed to fetch home page data:', err);
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
          setLoadingCategories(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="space-y-10 sm:space-y-16 lg:space-y-20 pb-12 sm:pb-20 text-softdark">
      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white p-6 sm:p-14 lg:p-16 shadow-2xl border border-primary-800/50">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-accent-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-800/80 text-primary-200 text-xs font-bold uppercase tracking-wider border border-primary-700/60 backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-accent-400" />
              Sàn Thương Mại Điện Tử Sinh Thái Hàng Đầu
            </div>

            <h1 className="text-xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Tiêu Dùng Bền Vững <br />
              Chuẩn Xanh EcoMart
            </h1>

            <p className="text-primary-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              Khám phá hàng ngàn sản phẩm sinh thái, chứng nhận hữu cơ quốc tế đạt minh bạch chỉ số <strong className="text-amber-300 font-bold">Eco-Score 1-5★</strong>. Đóng gói 100% vật liệu tái chế, giao hàng COD toàn quốc.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-row gap-3 items-center">
              <Button
                to="/products"
                variant="primary"
                size="sm"
                className="group gap-2 shadow-xl shadow-primary-950/50 px-4 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:-rotate-12 duration-300 text-primary-200" />
                <span>Khám Phá Sản Phẩm</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5 duration-300 text-primary-200" />
              </Button>

              <Button
                to="/contact"
                variant="glass"
                size="sm"
                className="gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl"
              >
                Về Chúng Tôi
              </Button>
            </div>

            <div className="pt-4 sm:pt-6 flex flex-wrap gap-x-4 gap-y-2 border-t border-primary-800/80 text-primary-200 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-300 shrink-0" />
                <span>100% Hữu cơ & Xanh</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-300 shrink-0" />
                <span>Eco-Score Minh bạch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-300 shrink-0" />
                <span>Giao hàng COD</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 hidden sm:block">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-500 to-primary-400 rounded-3xl blur-2xl opacity-20 transform rotate-6" />
              <div className="relative rounded-2xl sm:rounded-3xl bg-primary-900/90 border border-primary-700/70 p-4 sm:p-6 space-y-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-primary-800 pb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 bg-primary-800 rounded-xl text-primary-300">
                      <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">Chỉ Số Eco-Score</h4>
                      <p className="text-[10px] sm:text-xs text-primary-300">Tiêu chuẩn đánh giá 5 sao</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold">
                    5.0 ★
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 sm:p-3 bg-primary-950/60 rounded-2xl border border-primary-800/80 flex items-center gap-2.5 text-xs">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                    <span className="text-primary-200">Đạt chứng nhận USDA Organic & Fair Trade</span>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-primary-950/60 rounded-2xl border border-primary-800/80 flex items-center gap-2.5 text-xs">
                    <Recycle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
                    <span className="text-primary-200">Đóng gói giấy tái chế 0% nhựa nguyên sinh</span>
                  </div>
                </div>

                <div className="pt-1 text-center text-xs text-primary-300">
                  🌱 Hơn <strong>15.000+</strong> gia đình đồng hành sống xanh
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. VALUE PROPOSITIONS (Cam Kết & Lợi Ích Cốt Lõi)
      ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-surface rounded-2xl sm:rounded-3xl border border-border hover:border-primary-400/60 hover:shadow-lg transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm text-softdark mb-1">Minh Bạch Eco-Score</h3>
          <p className="text-xs text-softdark-muted leading-relaxed">
            Mỗi sản phẩm đều có điểm đánh giá sinh thái từ 1 đến 5 sao theo tiêu chuẩn khắt khe.
          </p>
        </div>

        <div className="p-4 sm:p-6 bg-surface rounded-2xl sm:rounded-3xl border border-border hover:border-primary-400/60 hover:shadow-lg transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm text-softdark mb-1">Chứng Nhận Quốc Tế</h3>
          <p className="text-xs text-softdark-muted leading-relaxed">
            Cam kết 100% sản phẩm đạt chứng nhận hữu cơ quốc tế như USDA, Fair Trade, FSC.
          </p>
        </div>

        <div className="p-4 sm:p-6 bg-surface rounded-2xl sm:rounded-3xl border border-border hover:border-primary-400/60 hover:shadow-lg transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <Recycle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm text-softdark mb-1">Đóng Gói 0% Nhựa</h3>
          <p className="text-xs text-softdark-muted leading-relaxed">
            Sử dụng hoàn toàn vật liệu phân hủy sinh học và thùng giấy tái chế bảo vệ đại dương.
          </p>
        </div>

        <div className="p-4 sm:p-6 bg-surface rounded-2xl sm:rounded-3xl border border-border hover:border-primary-400/60 hover:shadow-lg transition-all group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-sm text-softdark mb-1">Giao Hàng COD Toàn Quốc</h3>
          <p className="text-xs text-softdark-muted leading-relaxed">
            Kiểm tra sản phẩm tận tay trước khi thanh toán. Hỗ trợ đổi trả trong vòng 7 ngày.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100/90 text-primary-900 border border-primary-300/80 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Recycle className="w-4 h-4 text-primary-700" />
              Khám phá danh mục
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-softdark tracking-tight">
              Danh mục sản phẩm nổi bật
            </h2>
          </div>

          <Button
            to="/products"
            variant="link"
            className="text-xs group gap-1"
          >
            Xem tất cả danh mục
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 sm:h-32 bg-primary-100/70 animate-pulse rounded-2xl sm:rounded-3xl border border-primary-200/50" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Recycle}
            title="Đang Cập Nhật Danh Mục Sinh Thái"
            description="Hệ thống đang đồng bộ các nhóm danh mục đạt chuẩn xanh mới nhất. Bạn có thể khám phá toàn bộ sản phẩm cửa hàng ngay bên dưới!"
            variant="primary"
            action={
              <Button to="/products" variant="primary" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Khám Phá Tất Cả Sản Phẩm
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group p-3.5 sm:p-4 bg-surface border border-border hover:border-primary-500/60 rounded-2xl sm:rounded-3xl text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col items-center justify-center min-h-[105px] sm:min-h-[115px] shadow-xs"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 mx-auto rounded-2xl bg-primary-100/80 text-primary-800 flex items-center justify-center mb-2 group-hover:bg-primary-700 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-2xs shrink-0">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-6" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-softdark group-hover:text-primary-800 transition-colors line-clamp-1 leading-tight px-1">
                  {cat.name}
                </h4>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-100/90 text-accent-950 border border-accent-300/80 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Award className="w-4 h-4 text-accent-700" />
              Tuyển Chọn Mới Nhất
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-softdark tracking-tight">
              Sản Phẩm Sinh Thái Vừa Lên Kệ
            </h2>
          </div>

          <Button
            to="/products"
            variant="link"
            className="text-xs group gap-1"
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-primary-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Chưa Có Sản Phẩm Được Cập Nhật"
            description="Chúng tôi đang cập nhật các dòng sản phẩm đạt chuẩn Eco-Score mới nhất. Hãy quay lại sau hoặc xem tất cả danh mục nhé!"
            variant="primary"
            action={
              <Button to="/products" variant="primary" size="sm" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Khám Phá Tất Cả Sản Phẩm
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="p-6 sm:p-10 sm:p-14 bg-surface-green border border-border rounded-2xl sm:rounded-[2.5rem] space-y-8 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-200 text-primary-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-primary-700" />
            Tiêu Chuẩn & Chứng Nhận Xanh
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-softdark tracking-tight">
            Minh Bạch Nguồn Gốc & Chất Lượng
          </h2>
        </div>

        {loadingCerts ? (
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-32 bg-primary-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : certifications.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-4 bg-surface rounded-2xl border border-border text-center space-y-2 shadow-xs hover:border-primary-400 transition-all"
              >
                {cert.iconUrl ? (
                  <img
                    src={cert.iconUrl}
                    alt={cert.name}
                    className="w-10 h-10 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 mx-auto rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
                <h5 className="font-bold text-xs text-softdark line-clamp-1">{cert.name}</h5>
                <p className="text-[10px] text-softdark-muted line-clamp-1">{cert.description || 'Tiêu chuẩn sinh thái'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-surface rounded-2xl border border-border font-bold text-xs text-softdark">
              🌿 USDA Organic
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border font-bold text-xs text-softdark">
              🤝 Fair Trade Certified
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border font-bold text-xs text-softdark">
              🌲 FSC Forest Stewardship
            </div>
            <div className="p-4 bg-surface rounded-2xl border border-border font-bold text-xs text-softdark">
              ♻️ EcoCert Certified
            </div>
          </div>
        )}
      </section>

      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-softdark text-white p-6 sm:p-10 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 text-accent-400 text-xs font-bold uppercase tracking-wider">
              <TreePine className="w-4 h-4" />
              Sứ Mệnh Xanh EcoMart
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-4xl font-black tracking-tight leading-tight">
              Cùng Nhau Giảm Thải <br />
              <span className="text-accent-400">Vì Một Trái Đất Xanh</span>
            </h2>
            <p className="text-xs sm:text-sm text-softdark-light leading-relaxed">
              Mỗi đơn hàng tại EcoMart là một đóng góp thiết thực cho quỹ trồng rừng nguyên sinh và chiến dịch thu gom rác thải nhựa đại dương tại Việt Nam.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-6 text-center">
            <div className="p-3 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="text-xl sm:text-2xl lg:text-4xl font-black text-accent-400">15.000+</div>
              <div className="text-[10px] sm:text-xs text-softdark-light mt-1">Cây xanh đã được trồng</div>
            </div>
            <div className="p-3 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="text-xl sm:text-2xl lg:text-4xl font-black text-primary-400">50 Tấn</div>
              <div className="text-[10px] sm:text-xs text-softdark-light mt-1">Rác thải nhựa đã giảm thiểu</div>
            </div>
            <div className="p-3 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="text-xl sm:text-2xl lg:text-4xl font-black text-primary-300">98%</div>
              <div className="text-[10px] sm:text-xs text-softdark-light mt-1">Sản phẩm đạt Eco-Score 4-5★</div>
            </div>
            <div className="p-3 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="text-xl sm:text-2xl lg:text-4xl font-black text-accent-300">100%</div>
              <div className="text-[10px] sm:text-xs text-softdark-light mt-1">Đóng gói vật liệu sinh học</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5 sm:space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-700">
            <Heart className="w-4 h-4 text-primary-600 fill-primary-600" />
            Ý Kiến Khách Hàng
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-softdark tracking-tight">
            Cộng Đồng Sống Xanh Nói Gì?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 sm:p-6 bg-surface border border-border rounded-2xl sm:rounded-3xl space-y-3 shadow-xs">
            <StarRating rating={5} />
            <p className="text-xs text-softdark-muted leading-relaxed">
              "Mình cực kỳ ấn tượng với điểm Eco-Score minh bạch của EcoMart. Hàng đóng gói bằng túi tinh bột ngô phân hủy hoàn toàn, không có miếng nilon nào!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-border-muted">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-200 text-primary-800 font-bold flex items-center justify-center text-xs">
                AN
              </div>
              <div>
                <h5 className="font-bold text-xs text-softdark">Nguyễn Phương Anh</h5>
                <p className="text-[10px] text-softdark-muted">TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-surface border border-border rounded-2xl sm:rounded-3xl space-y-3 shadow-xs">
            <StarRating rating={5} />
            <p className="text-xs text-softdark-muted leading-relaxed">
              "Sản phẩm hữu cơ ở đây chuẩn nguồn gốc, đầy đủ tem USDA. Giao hàng COD cực nhanh, nhân viên thân thiện. Sẽ ủng hộ dài lâu!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-border-muted">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-200 text-primary-800 font-bold flex items-center justify-center text-xs">
                MINH
              </div>
              <div>
                <h5 className="font-bold text-xs text-softdark">Trần Minh Hoàng</h5>
                <p className="text-[10px] text-softdark-muted">Hà Nội</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-surface border border-border rounded-2xl sm:rounded-3xl space-y-3 shadow-xs">
            <StarRating rating={5} />
            <p className="text-xs text-softdark-muted leading-relaxed">
              "Giá cả hợp lý cho sản phẩm xanh. Từ khi biết EcoMart, căn bếp nhà mình đã giảm bớt 80% đồ nhựa dùng 1 lần."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-border-muted">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-200 text-primary-800 font-bold flex items-center justify-center text-xs">
                THU
              </div>
              <div>
                <h5 className="font-bold text-xs text-softdark">Lê Thị Thu Thảo</h5>
                <p className="text-[10px] text-softdark-muted">Đà Nẵng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. NEWSLETTER SUBSCRIBE BANNER
      ========================================================================= */}
      <NewsletterSection />
    </div>
  );
};

export default HomePage;