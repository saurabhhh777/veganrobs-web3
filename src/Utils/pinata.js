import { pinata_key, pinata_secret } from "../Constants/config";
import axios from "axios";
import toast from "react-hot-toast";

// Utility function to get IPFS URL with fallback gateways
export const getIPFSURL = (hash) => {
  if (!hash) {
    console.log("getIPFSURL: No hash provided");
    return null;
  }
  
  console.log("getIPFSURL input:", hash);
  
  // If it's already a full URL, return it as is
  if (hash.startsWith('http')) {
    console.log("getIPFSURL: Already a full URL, returning as is");
    return hash;
  }
  
  // Remove any existing gateway prefix
  const cleanHash = hash.replace(/^https?:\/\/[^\/]+\/ipfs\//, '');
  console.log("getIPFSURL clean hash:", cleanHash);
  
  // Try different IPFS gateways
  const gateways = [
    `https://vrdao.mypinata.cloud/ipfs/${cleanHash}`,
    `https://ipfs.io/ipfs/${cleanHash}`,
    `https://gateway.pinata.cloud/ipfs/${cleanHash}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanHash}`,
  ];
  
  const result = gateways[0];
  console.log("getIPFSURL result:", result);
  return result;
};

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
