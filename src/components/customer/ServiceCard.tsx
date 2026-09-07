'use client';

import React from 'react';
import Link from 'next/link';
import { ServiceCategory } from '@/lib/data/mockData';
import { ServiceCategoryIcon } from '@/components/customer/ServiceCategoryIcon';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Flame, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  category: ServiceCategory;
  onSelect?: (category: ServiceCategory) => void;
  compact?: boolean;
}

export function ServiceCard({
  category,
  onSelect,
  compact = false,
}: ServiceCardProps) {
  if (compact) {
    return (
      <Link
        href={`/booking/${category.id}`}
        onClick={() => onSelect?.(category)}
        className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-200/80 hover:border-[#d96f4d] hover:shadow-md transition-all duration-200 text-center"
      >
        <div className="w-12 h-12 rounded-xl bg-[#f0e7d9] text-[#24172f] flex items-center justify-center mb-2 group-hover:bg-[#d96f4d] group-hover:text-white transition-colors">
          <ServiceCategoryIcon name={category.icon_url} className="w-6 h-6" />
        </div>
        <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#d96f4d] transition-colors">
          {category.name}
        </span>
        {category.name_hi && (
          <span className="text-[10px] text-gray-400 font-medium">
            {category.name_hi}
          </span>
        )}
        <span className="text-[11px] font-bold text-[#d96f4d] mt-1">
          ₹{category.base_price}
        </span>
      </Link>
    );
  }

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/90 hover:border-[#d96f4d] p-5 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Popular tag */}
      {category.popular && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3 text-amber-500 fill-current" />
          Popular
        </div>
      )}

      <div>
        <div className="w-12 h-12 rounded-2xl bg-[#f0e7d9] text-[#24172f] flex items-center justify-center mb-3.5 group-hover:bg-[#d96f4d] group-hover:text-white transition-colors">
          <ServiceCategoryIcon name={category.icon_url} className="w-6 h-6" />
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#d96f4d] transition-colors">
            {category.name}
          </h3>
          {category.name_hi && (
            <span className="text-xs text-gray-400 font-medium">
              ({category.name_hi})
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
          {category.description}
        </p>

        <div className="flex items-center gap-2 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-medium bg-gray-100/80 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3 h-3 text-[#e6aa3b]" />
            Verified Society Workers
          </span>
          {category.emergency_multiplier > 1 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3" />
              Emergency SOS
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Base Starting</span>
          <span className="text-base font-extrabold text-gray-900">
            ₹{category.base_price}
          </span>
        </div>

        <Link
          href={`/booking/${category.id}`}
          onClick={() => onSelect?.(category)}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'bg-[#24172f] hover:bg-[#3d2b48] text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs group-hover:translate-x-0.5 transition-all'
          )}
        >
          Book Service
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}
