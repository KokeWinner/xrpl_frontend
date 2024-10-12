import * as React from 'react';
import { Lightbox } from "react-modal-image";
import { useState, useContext } from 'react';
import { AppContext } from 'src/AppContext';
import Head from 'next/head';
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

//import { useTranslation } from 'next-i18next'
function t (key) {
  let val = '';
  switch (key) {
    case 'general.loading':'image'
      val = 'Loading...';
      break;
    case 'general.load-failed':
      val = 'Failed to load';
      break;
    case 'general.no-uri':
      val = 'No URI specified';
      break;
    case 'general.no-image':
      val = 'No media found';
      break;
    case 'tabs.image':
      val = 'Image';
      break;
    case 'tabs.video':
      val = 'Video';
      break;
    case 'tabs.animation':
      val = 'Animation';
      break;
    case 'tabs.audio':
      val = 'Audio';
      break;
    case 'tabs.model':
      val = '3D model';
      break;
    case 'tabs.viewer':
      val = 'Viewer';
      break;
    case 'general.viewer':
      val = 'Viewer';
      break;
  }
  return val;
}
//import { stripText } from "../utils" // for model

import Tabs from './Tabs'

// Material
import {
    Card,
    CardMedia,
    Link,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Utils
import { getNftFilesUrls/*, nftName*/ } from 'src/utils/parse/utils';

export default function NFTPreview({ nft }) {
    const { darkMode } = useContext(AppContext);
	  const noImg = '/static/nft_no_image.webp'
    //const imgUrl = getImgUrl(nft/*, 480*/) || noImg;
    //const ipfsImgUrl = getImgUrl(nft) || noImg; //getImgUrl(NFTokenID, meta) // TODO: check if all ok as required dfile, size missing
    //const isVideo = nft.meta?.video?true:false;

    // slider
    const [loadedSlider, setLoadedSlider] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const [sliderRef, instanceRef] = useKeenSlider({
      initial: 0,
      loop: true,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setLoadedSlider(true)
      },
    })
    function Arrow(props) {
      const disabled = props.disabled ? " arrow--disabled" : ""
      return (
        <IconButton
          onClick={props.onClick}
          disabled={props.disabled}
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            [props.left ? 'left' : 'right']: 8,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          {props.left ? <ArrowBackIosNewIcon /> : <ArrowForwardIosIcon />}
        </IconButton>
      )
    }

    const handleOpenImage = (imageUrl) => {
      setSelectedImageUrl(imageUrl);
      setOpenImage(true);
    };

    // const imgUrl = '/static/test.mp4';
    // const isVideo = true;

    const [openImage, setOpenImage] = useState(false);
    const [openAnimation, setOpenAnimation] = useState(false);

    const closeLightboxImage = () => {
        setOpenImage(false);
    }
    /*const closeLightboxAnimation = () => {
        setOpenAnimation(false);
    }*/

    //const nftName = nft.meta?.name || nft.meta?.Name || "No Name";

    //const [contentTab, setContentTab] = useState("image")
    const [loaded, setLoaded] = useState(false)
    const [errored, setErrored] = useState(false)

    const style = {
        textAlign: "center",
        marginTop: "40px",
        marginBottom: "20px",
        marginLeft: "18px"
    };
    
    const loadingImage = () => {
    if (errored) {
        return <div style={style}>{t("general.load-failed")}<br /></div>;
    } else if (!loaded) {
        return <div style={style}><span className="waiting"></span><br />{t("general.loading")}</div>;
    }
    }
 
    let imageUrl = getNftFilesUrls(nft, 'image');//console.log('imageUrl before', imageUrl)
    const animationUrl = getNftFilesUrls(nft, 'animation');//console.log('animationUrl before', animationUrl)
    const videoUrl = getNftFilesUrls(nft, 'video');//console.log('videoUrl before', videoUrl)
    const audioUrl = getNftFilesUrls(nft, 'audio');
    const modelUrl = getNftFilesUrls(nft, 'model');
    const viewerUrl = getNftFilesUrls(nft, 'viewer');

    const [contentTab, setContentTab] = useState(videoUrl ? 'video' : (animationUrl ? 'animation' : "image"))
  
    let modelState = null;
  
    const clUrl = {
      image: imageUrl?.[currentSlide]?.cachedUrl,
      animation: animationUrl?.[currentSlide]?.cachedUrl,
      video: videoUrl?.[currentSlide]?.cachedUrl,
      audio: audioUrl?.[currentSlide]?.cachedUrl,
      model: modelUrl?.[currentSlide]?.cachedUrl,
    }
    const contentTabList = [];
    if (videoUrl) {
      contentTabList.push({ value: 'video', label: (t("tabs.video")) });
    }
    if (animationUrl) {
      contentTabList.push({ value: 'animation', label: (t("tabs.animation")) });
    }
    if (imageUrl) {
      contentTabList.push({ value: 'image', label: (t("tabs.image")) });
    }
    if (modelUrl) {
      contentTabList.push({ value: 'model', label: (t("tabs.model")) });
    }

    if (!contentTabList.length) {
      contentTabList.push({ value: 'image', label: (t("tabs.image")) });
      imageUrl = noImg;
    }

    const imgOrAnimUrl = contentTab === 'image' ? imageUrl : contentTab === 'animation' ? animationUrl : '';

    //console.log('imageUrl after', imageUrl, 'imgOrAnimUrl', imgOrAnimUrl)
  
    let imageStyle = { width: "100%", height: "auto" };
    if (imageUrl) {
      if (imageUrl.slice(0, 10) === 'data:image') {
        imageStyle.imageRendering = 'pixelated';
      }
      if (nft.deletedAt) {
        imageStyle.filter = 'grayscale(1)';
      }
    }
    let errorStyle = { marginTop: "40px" };
    let defaultTab = contentTab;
    let defaultUrl = clUrl[contentTab];
    if (!imageUrl && contentTab === 'image') {
      if (clUrl['video']) {
        defaultTab = 'video';
        defaultUrl = clUrl['video'];
      } else if (clUrl['model']) {
        defaultTab = 'model';
        defaultUrl = clUrl['model'];
      }
    }

    //add attributes for the 3D model viewer 
    let modelAttr = []
    if (nft.metadata && (nft.metadata['3D_attributes'] || nft.metadata['3d_attributes'])) {
      modelAttr = nft.metadata['3D_attributes'] || nft.metadata['3d_attributes']
      const supportedAttr = [
        'environment-image',
        'exposure',
        'shadow-intensity',
        'shadow-softness',
        'camera-orbit',
        'camera-target',
        'skybox-image',
        'auto-rotate-delay',
        'rotation-per-second',
        'field-of-view',
        'max-camera-orbit',
        'min-camera-orbit',
        'max-field-of-view',
        'min-field-of-view',
        'disable-zoom',
        'orbit-sensitivity',
        'animation-name',
        'animation-crossfade-duration',
        'variant-name',
        'orientation',
        'scale'
      ]
      if (Array.isArray(modelAttr)) {
        for (let i = 0; i < modelAttr.length; i++) {
          if (supportedAttr.includes(modelAttr[i].attribute)) {
            modelAttr[i].value = stripText(modelAttr[i].value)
          } else {
            delete modelAttr[i]
          }
        }
      } else if (typeof modelAttr === 'object') {
        let metaModelAttr = modelAttr
        modelAttr = []
        Object.keys(metaModelAttr).forEach(e => {
          if (supportedAttr.includes(e)) {
            modelAttr.push({
              "attribute": e,
              "value": stripText(metaModelAttr[e])
            })
          }
        })
      }
    }

    const renderImageLink = (file) => (
      <Link
        component="button"
        underline="none"
        onClick={() => handleOpenImage(file.cachedUrl)}
        width="100%"
      >
        {loadingImage(nft)}
        <img
          style={{ ...imageStyle, display: (loaded ? "inline-block" : "none"), verticalAlign: 'bottom' /* removes bottom line */ }}
          onLoad={() => { setLoaded(true); setErrored(false) }}
          onError={({ currentTarget }) => {
            if (currentTarget.src === imageUrl && imageUrl !== clUrl.image) {
              currentTarget.src = clUrl.image;
            } else {
              setErrored(true);
            }
          }}
          src={(typeof file === 'string' ? file : file.thumbnail ? 'https://s2.xrpnft.com/d1/' + (file.thumbnail?.big || file.thumbnail?.small) : file.cachedUrl)}
          alt=""
        />
      </Link>
    )

    return <>
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
    {contentTabList.length > 1 && (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          tabList={contentTabList}
          tab={contentTab}
          setTab={setContentTab}
          name="content"
          sx={{ '& .MuiTab-root': { minWidth: 'auto' } }}
        />
        <Link href={clUrl[contentTab]} target="_blank" rel="noreferrer" sx={{ textDecoration: 'none' }}>
          <Typography variant='body2' color="primary">{t("tabs." + contentTab)} Link</Typography>
        </Link>
      </Box>
    )}

    <Box sx={{ position: 'relative' }}>
      {((imageUrl && contentTab === 'image') || (animationUrl && contentTab === 'animation')) && (
        <>
          {(typeof imgOrAnimUrl === 'object' && imgOrAnimUrl.length > 1) ? (
            <div className="navigation-wrapper">
              <div ref={sliderRef} className="keen-slider">
                {imgOrAnimUrl.map((file, index) => (
                  <div key={index} className={`keen-slider__slide number-slide${index + 1}`}>
                    {renderImageLink(file)}
                  </div>
                ))}
              </div>
              {loadedSlider && instanceRef.current && (
                <>
                  <Arrow
                    left
                    onClick={(e) =>
                      e.stopPropagation() || instanceRef.current?.prev()
                    }
                    disabled={currentSlide === 0}
                  />

                  <Arrow
                    onClick={(e) =>
                      e.stopPropagation() || instanceRef.current?.next()
                    }
                    disabled={
                      currentSlide === instanceRef.current.track.details.slides.length - 1
                    }
                  />
                </>
              )}

              {loadedSlider && instanceRef.current && (
                <div className="dots">
                  {[
                    ...Array(instanceRef.current.track.details.slides.length).keys(),
                  ].map((idx) => {
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          instanceRef.current?.moveToIdx(idx)
                        }}
                        className={"dot" + (currentSlide === idx ? " active" : "")}
                      ></button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : renderImageLink(typeof imgOrAnimUrl === 'string' ? imgOrAnimUrl : imgOrAnimUrl[0])}
          {openImage && (
            <Lightbox
              small={selectedImageUrl}
              large={selectedImageUrl}
              hideDownload
              hideZoom
              onClose={() => setOpenImage(false)}
              imageBackgroundColor={ darkMode ? "rgb(33, 37, 43)" : "rgb(244, 245, 251)"}
            />
          )}
        </>
      )}

      {videoUrl && defaultTab === 'video' && (
        <Box sx={{ p: 2 }}>
          <video
            poster={videoUrl[currentSlide].thumbnail ? 'https://s2.xrpnft.com/d1/' + (videoUrl[currentSlide].thumbnail?.big || videoUrl[currentSlide].thumbnail?.static ) : ''}
            playsInline
            muted
            loop
            controls
            style={{ width: "100%", height: "auto", borderRadius: 8 }}
          >
            <source src={videoUrl[currentSlide]?.cachedUrl} type="video/mp4" />
          </video>
        </Box>
      )}
      {modelUrl && defaultTab === 'model' &&
        <>
          {modelState === "loading" &&
            <div style={style}><span className="waiting"></span><br />{t("general.loading")}</div>
          }
          {modelState !== "ready" &&
            <>
              <Head>
                <script
                  type="module"
                  src="/js/model-viewer.min.js"
                  defer
                />
              </Head>
              <model-viewer
                className="model-viewer"
                src={modelUrl[currentSlide]?.cachedUrl}
                camera-controls
                auto-rotate
                ar
                poster={LoadingGif}
                autoplay
                {
                ...modelAttr?.reduce((prev, curr) => {
                  prev[curr.attribute] = curr.value
                  return prev;
                }, {})
                }
              >
              </model-viewer>
            </>
          }
        </>
      }
      {contentTabList.length < 2 && defaultUrl &&
        <Box sx={{ p: 2 }}>
          <Link href={defaultUrl} target="_blank" rel="noreferrer">
            <Typography variant='body1' noWrap>{t("tabs." + defaultTab)} Link</Typography>
          </Link>
        </Box>
      }

      {defaultTab !== 'model' && audioUrl && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <audio src={audioUrl[currentSlide]?.cachedUrl} controls style={{ width: '100%', marginBottom: 16 }}></audio>
          <Link href={clUrl.audio} target="_blank" rel="noreferrer" sx={{ textDecoration: 'none' }}>
            <Typography variant='body2' color="primary">{t("tabs.audio")} Link</Typography>
          </Link>
        </Box>
      )}
      {viewerUrl && (
        <Box sx={{ p: 2, textAlign: 'right' }}>
          <Link href={viewerUrl[currentSlide]?.cachedUrl} target="_blank" rel="noreferrer" sx={{ textDecoration: 'none' }}>
            <Typography variant='body2' color="primary">{t("general.viewer")}</Typography>
          </Link>
        </Box>
      )}
    </Box>
  </Card>
</>

}
