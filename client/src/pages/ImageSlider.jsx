import React from 'react';
import Slider from 'react-slick';
import image1 from "../assets/hero..jpg"

const ImageWithNoEffect = ({ imageSrc, altText }) => {
  return (
    <div style={{ display: 'inline-block' }}>
      <img
        src={imageSrc}
        alt={altText}
        style={{
          width: '100%',
          height: '10%',
          borderRadius: '10px',
        }}
      />
    </div>
  );
};

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    centerMode: true,
    centerPadding: '10%', 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true, 
    prevArrow: <CustomPrevArrow />, 
    nextArrow: <CustomNextArrow />,
  };

  return (
    <div className="slider-container xl:pt-0 pt-6">
  <Slider {...settings}>
    <div className="w-full">
      <ImageWithNoEffect imageSrc={image1} altText="Image 1" />
    </div>
    <div className="w-full">
      <ImageWithNoEffect imageSrc={image1} altText="Image 2" />
    </div>
    <div className="w-full">
      <ImageWithNoEffect imageSrc={image1} altText="Image 3" />
    </div>
  </Slider>
</div>

  );
};

const CustomPrevArrow = ({ onClick }) => {
  return (
    <div className="custom-arrow custom-prev" onClick={onClick}>
      &#9664;
    </div>
  );
};

const CustomNextArrow = ({ onClick }) => {
  return (
    <div className="custom-arrow custom-next" onClick={onClick}>
      &#9654;
    </div>
  );
};

export default ImageSlider;
