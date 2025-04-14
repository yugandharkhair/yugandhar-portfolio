"use client";

import { Content, asImageSrc, isFilled } from "@prismicio/client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { MdArrowOutward } from "react-icons/md";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { PrismicNextImage } from "@prismicio/next";

gsap.registerPlugin(ScrollTrigger);

type ContentListProps = {
  items: Content.BlogPostDocument[] | Content.ProjectDocument[];
  contentType: Content.ContentIndexSlice["primary"]["content_type"];
  fallbackItemImage: Content.ContentIndexSlice["primary"]["fallback_item_image"];
  viewMoreText: Content.ContentIndexSlice["primary"]["view_more_text"];
};

export default function ContentList({
  items,
  contentType,
  fallbackItemImage,
  viewMoreText = "Read More",
}: ContentListProps) {
  const component = useRef(null);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);

  const urlPrefix = contentType === "Blog" ? "/blog" : "/projects";

  useEffect(() => {
    // Animate grid items in with a stagger
    let ctx = gsap.context(() => {
      itemsRef.current.forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "elastic.out(1,0.3)",
            stagger: 0.2,
            scrollTrigger: {
              trigger: item,
              start: "top bottom-=100px",
              end: "bottom center",
              toggleActions: "play none none none",
            },
          },
        );
      });
      return () => ctx.revert(); // cleanup!
    }, component);
  }, []);

  // Preload images
  useEffect(() => {
    items.forEach((item) => {
      const image = isFilled.image(item.data.hover_image)
        ? item.data.hover_image
        : fallbackItemImage;
      
      if (isFilled.image(image)) {
        const img = new Image();
        img.src = asImageSrc(image, {
          fit: "crop",
          w: 400,
          h: 300,
        }) || "";
      }
    });
  }, [items, fallbackItemImage]);

  return (
    <div ref={component}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {isFilled.keyText(item.data.title) && (
              <div
                className="project-card opacity-0 flex flex-col bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:shadow-lg hover:border-yellow-400"
                ref={(el) => (itemsRef.current[index] = el)}
              >
                <Link href={urlPrefix + "/" + item.uid} aria-label={item.data.title} className="flex flex-col h-full">
                  <div className="project-image relative aspect-video overflow-hidden">
                    <PrismicNextImage
                      field={isFilled.image(item.data.hover_image) ? item.data.hover_image : fallbackItemImage}
                      className="w-full h-full object-cover"
                      imgixParams={{ fit: "crop", w: 600, h: 340, exp: -1 }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-200 mb-3">{item.data.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-sm font-medium text-yellow-400 bg-slate-700 px-2 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center mt-auto pt-3 text-slate-300 text-sm font-medium">
                      <span>{viewMoreText}</span>
                      <MdArrowOutward className="ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}