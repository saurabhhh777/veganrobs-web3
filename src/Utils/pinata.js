import { pinata_key, pinata_secret } from "../Constants/config";
import axios from "axios";
import toast from "react-hot-toast";

export const pinFileToIPFS = async (file) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let formData = new FormData();
  formData.append("file", file);

  return axios
    .post(url, formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${formData._boundary}`,
        pinata_api_key: pinata_key,
        pinata_secret_api_key: pinata_secret,
      },
    })
    .then(function (response) {
      //handle response here
      console.log(response);
      toast.success("File uploaded to IPFS successfully!");
      return {
        success: true,
        pinataUrl:
          "https://vrdao.mypinata.cloud/ipfs/" + response.data.IpfsHash,
      };
    })
    .catch(function (error) {
      //handle error here
      console.log(error);
      toast.error("Failed to upload file to IPFS: " + error.message);
      return {
        success: false,
        message: error.message,
      };
    });
};
