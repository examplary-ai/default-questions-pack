import { FrontendPrintComponent } from "@examplary/ui";

const PrintComponent: FrontendPrintComponent = ({ t }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            aspectRatio: "1/1",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid black",
          }}
        />
        <div style={{ flexGrow: 1 }}>{t("true")}</div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            aspectRatio: "1/1",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "2px solid black",
          }}
        />
        <div style={{ flexGrow: 1 }}>{t("false")}</div>
      </div>
    </div>
  );
};

export default PrintComponent;
