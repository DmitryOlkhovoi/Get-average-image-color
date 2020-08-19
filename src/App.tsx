import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import greenlet from "greenlet";
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";
import "./App.css";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const getAverageColor = greenlet(async (imageData: Uint8ClampedArray) => {
  const len = imageData.length;
  const pixelsCount = len / 4;
  const arraySum: number[] = [0, 0, 0, 0];

  for (let i = 0; i < len; i += 4) {
    arraySum[0] += imageData[i];
    arraySum[1] += imageData[i + 1];
    arraySum[2] += imageData[i + 2];
    arraySum[3] += imageData[i + 3];
  }

  return `rgba(${[
    ~~(arraySum[0] / pixelsCount),
    ~~(arraySum[1] / pixelsCount),
    ~~(arraySum[2] / pixelsCount),
    ~~(arraySum[3] / pixelsCount),
  ].join(",")})`;
});

function getImageSize(image: HTMLImageElement) {
  const height = (canvas.height =
    image.naturalHeight || image.offsetHeight || image.height);
  const width = (canvas.width =
    image.naturalWidth || image.offsetWidth || image.width);

  return {
    height,
    width,
  };
}

function App() {
  const [isOver, setIsOver] = useState(false);
  const [fileData, setFileData] = useState<string | ArrayBuffer | null>();
  const [bgColor, setBgColor] = useState("rgba(255, 255, 255, 255)");
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      const image = imageRef.current;
      const { height, width } = getImageSize(image);

      ctx!.drawImage(image, 0, 0);

      getAverageColor(ctx!.getImageData(0, 0, width, height).data).then(
        (res) => {
          setBgColor(res);
          setIsLoading(false);
        }
      );
    }
  }, [imageRef, fileData]);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    let reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result);
    };

    reader.readAsDataURL(e.dataTransfer.files[0]);

    setIsOver(false);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsOver(true);
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsOver(false);
  }

  return (
    <div className="App">
      <div
        style={{ backgroundColor: bgColor }}
        className={classnames("drop-zone", { "drop-zone-over": isOver })}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        {fileData ? (
          <img ref={imageRef} alt="Preview" src={fileData.toString()}></img>
        ) : null}

        <ClipLoader css={override} size={150} loading={isLoading} />
      </div>
    </div>
  );
}

export default App;
