import {Button, Card, Spin, Typography} from "antd";
import {useState} from "react";
import Paragraph from "antd/es/typography/Paragraph";

const {Title} = Typography;


export const PredictionResult = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    return (
        <div
            style={{
                flex: 1,
                background: "#f0f2f5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card
                style={{
                    width: "90%",
                    height: "90%",
                    borderRadius: 12,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "left",
                    alignItems: "center",
                }}
            >
                <Title level={4} style={{textAlign: 'center'}}>Prediction</Title>
                <Paragraph strong style={{fontSize: 40, color: "#1677ff", textAlign: 'center'}}>
                    {loading ? (
                        <Spin size="large"/>
                    ) : result ? (
                        result) : ('No prediction yet')}
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    block
                    style={{ borderRadius: 8}}
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => {
                            setResult(String(Math.floor(Math.random() * 10))); // dummy prediction
                            setLoading(false);
                        }, 1200);
                    }}
                >
                    Predict again
                </Button>
            </Card>
        </div>
    )
}