export default function AvatarUploader({ previewUrl, onFileChange, onUpload, disabled, buttonStyle }) {
    return (
      <>
        <input type="file" accept="image/*" onChange={onFileChange} />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            width={100}
            height={100}
            style={{ borderRadius: "50%", objectFit: "cover", marginTop: "1rem" }}
          />
        )}
        <button style={buttonStyle} onClick={onUpload} disabled={disabled}>
          Upload Avatar
        </button>
      </>
    );
  }