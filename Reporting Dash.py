import dash
from dash import dcc, html, dash_table, Input, Output
import plotly.express as px
import pandas as pd
import numpy as np

app = dash.Dash(__name__)

# Sample Data (mocked)
dates = pd.date_range(start="2025-04-01", periods=10)
resorts = ["Bear Mountain", "Lake Tahoe", "Alpine Ridge"]
booking_data = pd.DataFrame({
    "Date": np.tile(dates, 3),
    "Resort": np.repeat(resorts, 10),
    "Bookings": np.random.randint(100, 250, 30)
})

revenue_data = booking_data.groupby("Resort").agg({"Bookings": "sum"}).reset_index()
revenue_data.rename(columns={"Bookings": "Revenue"}, inplace=True)
revenue_data["Revenue"] *= 100

reservation_table = pd.DataFrame({
    "Reservation ID": ["#12345", "#12346", "#12347"],
    "User": ["John D.", "Alice B.", "Mark S."],
    "Resort": ["Bear Mountain", "Lake Tahoe", "Alpine Ridge"],
    "Time Slot": ["10:00–11:00 AM", "1:00–2:00 PM", "3:00–4:00 PM"],
    "Status": ["Confirmed", "Pending", "Cancelled"],
    "Payment Status": ["Paid", "Unpaid", "Refunded"]
})

user_data = pd.DataFrame({
    "Date": np.tile(dates, 3),
    "Resort": np.repeat(resorts, 10),
    "New Users": np.random.randint(20, 60, 30),
    "Returning Users": np.random.randint(50, 90, 30)
})

lift_status_data = pd.DataFrame({
    "Lift": ["Lift A", "Lift B", "Lift C"],
    "Status": ["Operational", "Maintenance", "Down"]
})

incident_data = pd.DataFrame({
    "Date": pd.date_range(start="2025-04-01", periods=5),
    "Incident": ["Lift Failure", "Power Outage", "Network Downtime", "Weather Delay", "Equipment Check"],
    "Status": ["Resolved", "Pending", "Resolved", "Ongoing", "Resolved"]
})

# Layout
app.layout = html.Div([
    html.H1("Snow Mountain Tracker - Admin Dashboard"),

    html.Div([
        html.Label("Select Resort:"),
        dcc.Dropdown(
            id='resort-filter',
            options=[{"label": r, "value": r} for r in resorts],
            value="Bear Mountain",
            clearable=False
        ),
        html.Label("Select Date Range:"),
        dcc.DatePickerRange(
            id='date-range-filter',
            start_date=dates.min(),
            end_date=dates.max(),
            display_format='YYYY-MM-DD'
        )
    ], style={"width": "400px", "margin": "20px"}),

    html.Div([
        html.Div([
            html.H3("📅 Lift Reservations Today: 220"),
            html.H3("💵 Revenue Today: $15,000"),
            html.H3("🏔️ Active Snowy Mountains: 18"),
            html.H3("🚧 Road Closures: 3"),
        ], style={"padding": "20px"})
    ], style={"display": "flex", "justifyContent": "space-around"}),

    dcc.Graph(id="bookings-graph"),
    dcc.Graph(id="revenue-graph"),
    dcc.Graph(id="users-graph"),
    dcc.Graph(figure=px.bar(lift_status_data, x="Lift", y=[1]*len(lift_status_data), color="Status",
                            title="Lift Operational Status", labels={"y": "Status Count"})),
    dcc.Graph(figure=px.timeline(incident_data, x_start="Date", x_end="Date", y="Incident", color="Status",
                                 title="Maintenance and Incident Logs")),

    html.H3("Reservation Details"),
    dash_table.DataTable(
        columns=[{"name": i, "id": i} for i in reservation_table.columns],
        data=reservation_table.to_dict('records'),
        style_table={"overflowX": "auto"},
        style_cell={"textAlign": "left"}
    )
])

# Callbacks for filtering
@app.callback(
    Output("bookings-graph", "figure"),
    Output("revenue-graph", "figure"),
    Output("users-graph", "figure"),
    Input("resort-filter", "value"),
    Input("date-range-filter", "start_date"),
    Input("date-range-filter", "end_date")
)
def update_graphs(selected_resort, start_date, end_date):
    mask = (booking_data["Resort"] == selected_resort) & \
           (booking_data["Date"] >= pd.to_datetime(start_date)) & \
           (booking_data["Date"] <= pd.to_datetime(end_date))
    filtered_bookings = booking_data[mask]
    bookings_fig = px.line(filtered_bookings, x="Date", y="Bookings", title=f"Bookings Over Time - {selected_resort}")

    revenue = filtered_bookings["Bookings"].sum() * 100
    filtered_revenue = pd.DataFrame({"Resort": [selected_resort], "Revenue": [revenue]})
    revenue_fig = px.bar(filtered_revenue, x="Resort", y="Revenue", title=f"Revenue - {selected_resort}")

    user_mask = (user_data["Resort"] == selected_resort) & \
                (user_data["Date"] >= pd.to_datetime(start_date)) & \
                (user_data["Date"] <= pd.to_datetime(end_date))
    filtered_users = user_data[user_mask]
    users_fig = px.line(filtered_users, x="Date", y=["New Users", "Returning Users"],
                        title=f"New vs Returning Users - {selected_resort}")

    return bookings_fig, revenue_fig, users_fig

if __name__ == '__main__':
    app.run(debug=True)
