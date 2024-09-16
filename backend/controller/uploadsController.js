export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const imageUrls = req.files.map((file) => file.path);

    return res.status(200).json({ images: imageUrls });
  } catch (error) {
    console.error("Error in uploadImages controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
