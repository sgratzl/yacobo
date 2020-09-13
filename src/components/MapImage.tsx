import { useEffect, useRef, useState } from 'react';
import styles from './MapImage.module.scss';

export default function MapImage({ image, alt }: { image?: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null as HTMLImageElement | null);

  useEffect(() => {
    if (!image || !imgRef.current) {
      setLoading(true);
      return;
    }
    imgRef.current.onload = () => {
      setLoading(false);
    };
    if (imgRef.current.src === image && imgRef.current.complete) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [imgRef, image, setLoading]);

  return (
    <div className={styles.img}>
      {image && (
        <img
          ref={imgRef}
          className={styles.imgImg}
          src={image}
          srcSet={
            !image
              ? undefined
              : `${image} 1x, ${image}&scale=2 2x, ${image}&scale=3 3x, ${image}&scale=2 1000w, ${image}&scale=3 1500w, ${image}&scale=4 2000w`
          }
          alt={alt}
        />
      )}
      {loading && <img className={styles.imgPlaceholder} src={'/api/skeletons/map'} alt={alt} />}
    </div>
  );
}
