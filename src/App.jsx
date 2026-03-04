import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

const API_URL = "https://69a5bde2885dcb6bd6a92d88.mockapi.io/bookings";

const barbers = [
  { id: 1, name: "Алексей", start: 9, end: 18 },
  { id: 2, name: "Дмитрий", start: 10, end: 20 },
];

const services = [
  { id: 1, name: "Стрижка", duration: 60 },
  { id: 2, name: "Борода", duration: 30 },
  { id: 3, name: "Стрижка + Борода", duration: 90 },
];

export default function App() {
  const [barber, setBarber] = useState(null);
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);

  // Загрузка всех записей
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  const generateTimeSlots = useMemo(() => {
    if (!barber || !service) return [];

    const slots = [];
    const step = 30;
    const totalMinutes = (barber.end - barber.start) * 60;

    for (let m = 0; m <= totalMinutes - service.duration; m += step) {
      const h = barber.start + Math.floor(m / 60);
      const min = m % 60;
      slots.push(
        `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
      );
    }

    return slots;
  }, [barber, service]);

  const isBooked = (slot) => {
    return bookings.some(
      b =>
        b.barber === barber?.name &&
        b.date === date &&
        b.time === slot
    );
  };

  const handleBooking = async () => {
    if (!barber || !service || !date || !time) return;

    const newBooking = {
      barber: barber.name,
      service: service.name,
      date,
      time,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    });

    const saved = await res.json();

    // Добавляем новую запись в список без повторной загрузки
    setBookings(prev => [...prev, saved]);

    setTime("");
  };

  return (
    <div className="container">
      <h1>💈 Онлайн запись</h1>

      <div className="card">
        <h2>Мастер</h2>
        <div className="grid">
          {barbers.map(b => (
            <button
              key={b.id}
              className={barber?.id === b.id ? "active" : ""}
              onClick={() => setBarber(b)}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Услуга</h2>
        <div className="grid">
          {services.map(s => (
            <button
              key={s.id}
              className={service?.id === s.id ? "active" : ""}
              onClick={() => setService(s)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Дата</h2>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      {barber && service && date && (
        <div className="card">
          <h2>Время</h2>
          <div className="grid">
            {generateTimeSlots.map((slot, i) => (
              <button
                key={i}
                disabled={isBooked(slot)}
                className={`${time === slot ? "active" : ""} ${
                  isBooked(slot) ? "booked" : ""
                }`}
                onClick={() => setTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="confirm-btn" onClick={handleBooking}>
        Забронировать
      </button>

      {/* 📋 СПИСОК ЗАПИСЕЙ */}
      {bookings.length > 0 && (
        <div className="card">
          <h2>📅 Записи</h2>
          {bookings.map((b) => (
            <div key={b.id} className="booking-item">
              <strong>{b.date}</strong> | {b.time} | {b.barber} | {b.service}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}