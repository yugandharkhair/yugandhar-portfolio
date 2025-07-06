import Heading from "@/app/components/Heading";
import Bounded from "@/app/components/bounded";
import { Content, isFilled } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import ContentList from "./ContentList";
import { createClient } from "@/prismicio";

/**
 * Props for `ContentIndex`.
 */
export type ContentIndexProps = SliceComponentProps<Content.ContentIndexSlice>;

/**
 * Component for "ContentIndex" Slices.
 */
const ContentIndex = async ({ slice }: ContentIndexProps): Promise<JSX.Element> => {
  const client = createClient();
  const blogPosts = await client.getAllByType("blog_post");
  const projects = await client.getAllByType("project");

  const contentType = slice.primary.content_type || "Blog";

  // Handle the new "My Work" content type
  let items;
  let displayContentType = contentType;
  
  if (contentType === "My Work") {
    items = projects;
    displayContentType = "My Work";
  } else if (contentType === "Project") {
    items = projects;
    displayContentType = "Project";
  } else {
    items = blogPosts;
    displayContentType = "Blog";
  }

  // Sort projects by date (most recent first)
  if (displayContentType === "My Work" || displayContentType === "Project") {
    items = items.sort((a, b) => {
      const dateA = new Date(a.data.date || 0);
      const dateB = new Date(b.data.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <div className="text-center mb-12">
        <Heading size="lg" className="mb-6">
          {slice.primary.heading}
        </Heading>
        {isFilled.richText(slice.primary.desc) && (
          <div className="prose prose-xl prose-invert mx-auto max-w-3xl">
            <PrismicRichText field={slice.primary.desc} />
          </div>
        )}
      </div>
      
      <ContentList 
        items={items} 
        contentType={displayContentType} 
        viewMoreText={slice.primary.view_more_text} 
        fallbackItemImage={slice.primary.fallback_item_image}
      />
    </Bounded>
  );
};

export default ContentIndex;