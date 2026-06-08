import { useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";

interface Props {
  src: string;
  width: number;
  height: number;
}

export default function URLImage({ src, width, height }: Props) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = () => setImg(image);
    return () => {
      image.onload = null;
    };
  }, [src]);

  return <KonvaImage image={img ?? undefined} width={width} height={height} />;
}
