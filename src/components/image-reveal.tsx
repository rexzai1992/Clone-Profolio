"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ImageRevealProps extends Omit<ImageProps, "onLoad"> {
  wrapperClassName?: string;
  imageClassName?: string;
  previewClassName?: string;
  previewSrc?: string;
  instant?: boolean;
  delay?: number;
  revealOnView?: boolean;
  once?: boolean;
  showPlaceholder?: boolean;
}

export function ImageReveal({
  wrapperClassName,
  imageClassName,
  previewClassName,
  previewSrc,
  instant = false,
  delay = 0,
  revealOnView = true,
  once = true,
  showPlaceholder = true,
  style,
  ...props
}: ImageRevealProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const hasPreview = Boolean(previewSrc) && !hasPreviewError;
  const revealMediaImmediately = instant || isLoaded || (!showPlaceholder && !hasPreview);

  useEffect(() => {
    setIsLoaded(false);
    setHasPreviewError(false);
  }, [previewSrc, props.src]);

  useEffect(() => {
    if (!revealOnView || instant || reducedMotion) {
      setInView(true);
      return;
    }

    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" }
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [instant, once, reducedMotion, revealOnView]);

  const aspectRatioStyle = useMemo<CSSProperties | undefined>(() => {
    if (props.fill) {
      return undefined;
    }

    if (typeof props.width !== "number" || typeof props.height !== "number") {
      return undefined;
    }

    return { aspectRatio: `${props.width} / ${props.height}` };
  }, [props.fill, props.height, props.width]);

  const mergedWrapperStyle = useMemo<CSSProperties | undefined>(() => {
    const delayStyle = delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined;
    if (!aspectRatioStyle && !style && !delayStyle) {
      return undefined;
    }

    return { ...aspectRatioStyle, ...delayStyle, ...style };
  }, [aspectRatioStyle, delay, style]);

  const animateWrapper = revealOnView && !instant && !reducedMotion;
  const mediaState = instant || reducedMotion ? "instant" : revealMediaImmediately ? "visible" : "hidden";

  return (
    <div
      ref={frameRef}
      className={`image-reveal ${wrapperClassName ?? ""}`.trim()}
      style={mergedWrapperStyle}
      data-animate={animateWrapper ? "true" : "false"}
      data-inview={inView ? "true" : "false"}
      data-loaded={isLoaded ? "true" : "false"}
      data-media={mediaState}
    >
      {hasPreview ? (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          className={`image-reveal__preview ${previewClassName ?? ""}`.trim()}
          onError={() => setHasPreviewError(true)}
          loading="eager"
          decoding="async"
        />
      ) : showPlaceholder ? (
        <div className="image-reveal__placeholder" aria-hidden="true" />
      ) : null}
      <div className="image-reveal__media">
        <Image
          {...props}
          className={`image-reveal__img ${imageClassName ?? ""}`.trim()}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
}
