import React, { CSSProperties, useState, useEffect } from "react";

interface FooterStyles {
  footer: CSSProperties;
  clock: CSSProperties;
  quote: CSSProperties;
}

const styles: FooterStyles = {
  footer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
  },
  clock: {
    color: "#f7f7f7",
    opacity: 0.6,
    fontSize: "10px",
  },
  quote: {
    color: "#f7f7f7",
    opacity: 0.6,
    fontSize: "10px",
    textTransform: "uppercase",
  },
};

const Footer: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeZone = "America/New_York";
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const formattedTime = formatter.format(now);
      setCurrentTime(formattedTime + " UTC -5");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section style={styles.footer}>
        <span style={styles.clock}>{currentTime}</span>
        <span style={styles.quote}>v3.5</span>
      </section>
    </>
  );
};

export default Footer;
