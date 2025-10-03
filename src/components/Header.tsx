import Title from "antd/es/typography/Title";

export const Header = () => {
  return (            <div
      style={{
          background: "#1677ff",
          padding: "12px 24px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
  >
      <Title level={3} style={{ color: "white", margin: 0 }}>
          Number Prediction Playground
      </Title>
  </div>)
};