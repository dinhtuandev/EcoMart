import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Calendar, ArrowLeft, AlertCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { contentPageApi } from '../services/contentPageApi';
import { ContentPage as ContentPageType } from '../types';

export const ContentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [page, setPage] = useState<ContentPageType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchPage = async (): Promise<void> => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      try {
        const response = await contentPageApi.getPageBySlug(slug, controller.signal);
        if (isMounted) {
          if (response.data) {
            setPage(response.data);
          } else {
            setNotFound(true);
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'CanceledError') {
          console.error(`Failed to fetch page slug=${slug}:`, err);
          if (isMounted) {
            setNotFound(true);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-6 shadow-sm">
          <div className="h-10 bg-slate-200 rounded-2xl w-3/4" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/4" />
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <div className="h-4 bg-slate-100 rounded-lg w-full" />
            <div className="h-4 bg-slate-100 rounded-lg w-5/6" />
            <div className="h-4 bg-slate-100 rounded-lg w-4/6" />
            <div className="h-4 bg-slate-100 rounded-lg w-full" />
            <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Không Tìm Thấy Trang</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Trang thông tin hoặc chính sách với đường dẫn <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">/pages/{slug}</span> không tồn tại hoặc đã được chuyển đi.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20"
          >
            <ShoppingBag className="w-4 h-4" /> Mua Sắm Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-slate-400">Chính sách & Thông tin</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{page.title}</span>
      </div>

      {/* Main Content Card */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-gray-100 shadow-sm space-y-8">
        {/* Header */}
        <header className="space-y-4 border-b border-gray-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            EcoMart Official Policy
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {page.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Cập nhật lần cuối:{' '}
                {new Date(page.updatedAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-mono">slug: {page.slug}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div
          className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
};

export default ContentPage;
