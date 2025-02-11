function Output({ output }) {
  return (
    <div className="output flex justify-center items-center">
      <p
        className="text-justify"
        dangerouslySetInnerHTML={{ __html: output }}
      />
    </div>
  );
}

export default Output;
