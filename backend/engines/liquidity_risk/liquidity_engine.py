# def calculate_lcr(assets, outflows, inflows, params):
#     # 1. HQLA
#     hqla_raw = apply_haircuts(assets, params)  # L1/L2A/L2B after haircut
#     hqla = apply_l2_caps(hqla_raw)  # 40% L2 cap, 15% L2B cap

#     # 2. Outflows
#     total_outflows = sum(apply_runoff_rates(outflows, params))

#     # 3. Inflows (capped at 75% of outflows)
#     total_inflows = min(sum(apply_inflow_rates(inflows, params)), 0.75 * total_outflows)

#     net_outflows = total_outflows - total_inflows

#     lcr = hqla / net_outflows * 100
#     return {
#         "hqla": hqla,
#         "outflows": total_outflows,
#         "inflows": total_inflows,
#         "net_outflows": net_outflows,
#         "lcr_pct": lcr,
#     }
